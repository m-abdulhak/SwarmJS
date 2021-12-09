import { Body, World, Bodies } from 'matter-js';
import splitPolygon from 'split-polygon';

import generateStaticObject from '../staticObjects/staticObjectFactory';
import {
  distanceBetween2Points,
  closestPointInPolygonToPoint,
  shiftPointOfLineSegInDirOfPerpendicularBisector,
  pointIsInsidePolygon,
  getLineEquationParams,
  closePolygon
} from '../geometry';

import updateVelocity from './controllers/velocityController';
import updateWaypoint from './controllers/waypointController';
import updateGoal from './controllers/goalController';

import SensorManager from './sensors/sensorManager';

// eslint-disable-next-line no-unused-vars
export default class Robot {
  constructor(id, position, goal, sensors, radius, envWidth, envHeight, scene, algorithm) {
    // Configs
    this.DeadLockRecovery = {
      None: 0,
      Simple: 1,
      Advanced: 2
    };

    // Change Options Based on algorithm
    this.availableAlgorithms = [
      {
        name: 'Proposed Algorithm',
        limitPuckSelectionToBVC: true,
        environmentOrbit: true
      },
      {
        name: 'Baseline Algorithm',
        limitPuckSelectionToBVC: true,
        environmentOrbit: false
      }
    ];

    this.algorithmOptions = algorithm
      ? this.availableAlgorithms.find((a) => a.name === algorithm)
      : this.availableAlgorithms[0];

    this.id = id;
    this.radius = radius;
    this.velocity = { x: 0, y: 0 };
    this.velocityScale = 1;
    this.goal = goal;
    this.tempGoal = { x: position.x, y: position.y };
    this.envWidth = envWidth;
    this.envHeight = envHeight;
    this.scene = scene;
    this.engine = this.scene.engine;
    this.world = this.scene.world;
    this.VC = [];

    // Create Matter.js body and attach it to world
    this.body = Bodies.circle(position.x, position.y, this.radius);
    this.body.friction = 0;
    this.body.frictionAir = 0;
    this.body.frictionStatic = 0;
    this.body.restitution = 0;
    World.add(this.world, this.body);

    // Remove
    Body.setAngularVelocity(this.body, 1);

    // Velocities calculation strategy
    this.updateVelocity = updateVelocity(this);

    // Motion Planning
    this.updateWaypoint = updateWaypoint(this);

    // Goal Planning
    this.updateGoal = updateGoal(this);

    // Pucks
    this.bestPuck = null;

    // Obstacles
    this.obstacleSensingRadius = this.radius * 10;

    // Sensors
    this.sensors = new SensorManager(this.scene, this, sensors);
    this.sensors.start();
    this.readSensorValues();

    this.changeAlgorithm = (newAlgorithm) => {
      this.algorithmOptions = this.availableAlgorithms.find((a) => a.name === newAlgorithm);
    };

    this.changeAlgorithm.bind(this);
  }

  readSensorValues() {
    this.sensorValues = this.sensors.readAll();
  }

  sense(sensorName) {
    return this.sensors.sense(sensorName);
  }

  setPosition(newPosition) {
    Body.set(this.body, 'position', { x: newPosition.x, y: newPosition.y });
    this.sensors.update();
    this.readSensorValues();
  }

  setGoal(newGoal) {
    this.goal = { x: newGoal.x, y: newGoal.y };
  }

  setTempGoal(tempGoal) {
    this.tempGoal = { x: tempGoal.x, y: tempGoal.y };
  }

  setBestPuck(puck) {
    this.bestPuck = puck;
  }

  timeStep() {
    // Update sensors
    this.sensors.update();
    this.readSensorValues();

    // Get new position and orientation from engine

    // Update goal
    const newGoalRaw = this.updateGoal(this.sense('position'));
    const newGoal = this.limitGoal(newGoalRaw);
    this.setGoal(newGoal);

    // Update waypoint, according to new goal
    const newWaypoint = this.updateWaypoint();
    this.setTempGoal(newWaypoint);

    // Update velocities, according to new waypoint
    const velocities = this.updateVelocity();
    this.setVelocities(velocities);
  }

  setVelocities({ linearVel, angularVel }) {
    this.setLinearVelocity(linearVel);
    this.setAngularVelocity(angularVel);
  }

  setLinearVelocity(linearVel) {
    Body.setVelocity(this.body, { x: linearVel.x, y: linearVel.y });
  }

  setAngularVelocity(angularVel) {
    Body.setAngularVelocity(this.body, angularVel);
  }

  // Static Obstacles
  getNearbyObstacles() {
    const staticObstacles = [...this.scene.staticObjects.filter(
      (obj) => obj.getDistanceToBorder(this.sense('position')) < this.obstacleSensingRadius
    )];

    // Add pucks that reached goal as obstacles
    this.sense('nearbyPucks').forEach((puck) => {
      if (puck.deepInGoal() && this.getDistanceTo(puck.position) > this.radius) {
        // Add chance to ignore object if it is close to the current goal puck
        // if (this.bestPuck
        //     && this.bestPuck.position
        //     && puck.getDistanceTo(this.bestPuck.position) > this.radius * 1) {
        const staticObstacleDefinition = puck.generateStaticObjectDefinition();
        staticObstacles.push(generateStaticObject(staticObstacleDefinition, this.scene, false));
        // }
      }
    });

    return staticObstacles;
  }

  getAllClosestPointsToNearbyObstacles() {
    const closeObstacles = this.getNearbyObstacles();
    return closeObstacles.map(
      (staticObs) => staticObs.getIntersectionPoint(this.sense('position'))
    );
  }

  getClosestPointToNearbyObstacles() {
    const points = this.getAllClosestPointsToNearbyObstacles();

    if (points.length === 0) {
      return null;
    }

    return points.reduce((acc, point) => {
      if (acc === null || this.getDistanceTo(point) < this.getDistanceTo(acc)) {
        return point;
      }
      return acc;
    }, null);
  }

  trimVCwithStaticObstacles() {
    const closestPoint = this.getClosestPointToNearbyObstacles();

    if (closestPoint == null) {
      return;
    }

    const secondLinePoint = shiftPointOfLineSegInDirOfPerpendicularBisector(
      closestPoint.x,
      closestPoint.y,
      closestPoint.x,
      closestPoint.y,
      this.sense('position').x,
      this.sense('position').y,
      1
    );

    const splittingLineParams = getLineEquationParams(closestPoint, secondLinePoint);

    const splitPolygonRes = this.VC && this.VC.length > 2
      ? splitPolygon(this.VC, splittingLineParams)
      : { positive: this.VC, negative: [] };
    const splitPolygonParts = [splitPolygonRes.positive, splitPolygonRes.negative];
    splitPolygonParts.map(
      (poly) => closePolygon(poly)
    );

    if (pointIsInsidePolygon(this.sense('position'), splitPolygonParts[0])) {
      [this.VC] = splitPolygonParts;
    } else {
      [, this.VC] = splitPolygonParts;
    }
  }

  pointIsReachableInEnvBounds(goalPoint) {
    let reachable = true;

    const closestPointInEnvBoundsToGoalPoint = closestPointInPolygonToPoint(
      this.scene.environmentBounds,
      goalPoint
    );

    const pointDistToEnvBounds = distanceBetween2Points(
      goalPoint,
      closestPointInEnvBoundsToGoalPoint
    );

    if (pointDistToEnvBounds <= this.radius * 1.1) {
      reachable = Math.random() < 0.1;
    }

    return reachable;
  }

  pointIsReachableOutsideStaticObs(goalPoint) {
    let reachable = true;

    this.scene.staticObjects.forEach((staticObj) => {
      if (reachable && !staticObj.pointIsReachableByRobot(goalPoint, this)) {
        reachable = false;
      }
    });

    return reachable;
  }

  reachedGoal() {
    const ret = this.reached(this.goal);
    return ret;
  }

  reachedTempGoal() {
    const ret = this.reached(this.tempGoal);
    return ret;
  }

  reached(point) {
    const ret = this.getDistanceTo(point) <= this.radius / 50;
    return ret;
  }

  getDistanceTo(point) {
    const ret = distanceBetween2Points(this.sense('position'), point);
    return ret;
  }

  limitPos(position) {
    const { radius } = this;
    this.velocity.x = position.x <= radius || position.x >= this.envWidth - radius
      ? this.velocity.x * -1 : this.velocity.x;
    this.velocity.y = position.y <= radius || position.y >= this.envHeight - radius
      ? this.velocity.y * -1 : this.velocity.y;

    return {
      x: Math.min(Math.max(radius, position.x), this.envWidth - radius),
      y: Math.min(Math.max(radius, position.y), this.envHeight - radius)
    };
  }

  limitGoal(goal) {
    const { radius } = this;
    const newGoal = {
      x: Math.min(Math.max(radius, goal.x), this.envWidth - radius),
      y: Math.min(Math.max(radius, goal.y), this.envHeight - radius)
    };

    this.scene.staticObjects.forEach((staticObj) => {
      let diffX = null;
      let diffY = null;
      while (!staticObj.pointIsReachableByRobot(newGoal, this)) {
        diffX = diffX || newGoal.x - this.sense('position').x;
        diffY = diffY || newGoal.y - this.sense('position').y;
        newGoal.x += diffX;
        newGoal.y += diffY;
      }
    });

    return newGoal;
  }

  collidingWithRobot(r) {
    return distanceBetween2Points(this.sense('position'), r.sensotValues.position) < this.radius * 2;
  }

  getNeighborRobotsDistanceMeasurements(robots) {
    let minDist = -1;

    robots.forEach((r) => {
      const distance = distanceBetween2Points(this.sense('position'), r.sensotValues.position);

      // If first or closest neighbor, set distanceas min distance
      if (minDist === -1 || distance < minDist) {
        minDist = distance;
      }
    });

    return { minDistance: minDist };
  }
}
