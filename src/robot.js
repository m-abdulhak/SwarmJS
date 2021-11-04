/* eslint-disable prefer-destructuring */
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
import { Body, World, Bodies } from 'matter-js';
import splitPolygon from 'split-polygon';

import updateWaypoint from './motionPlanning';
import updateGoal from './goalSelect';
import { generateStaticObject } from './staticObjects/staticObjectFactory';
import {
  distanceBetween2Points,
  closestPointInPolygonToPoint,
  shiftPointOfLineSegInDirOfPerpendicularBisector,
  pointIsInsidePolygon,
  getLineEquationParams
} from './geometry';

// eslint-disable-next-line no-unused-vars
export default class Robot {
  constructor(id, position, goal, radius, envWidth, envHeight, scene, algorithm) {
    // Configs
    this.DeadLockRecovery = {
      None: 0,
      Simple: 1,
      Advanced: 2
    };

    // Change Options Based on algorithm
    this.defaultOptions = {
      // Baseline Algorithm Features
      1: {
        limitPuckSelectionToBVC: true,
        environmentOrbit: false
      },
      // Proposed Algorithm Features
      2: {
        limitPuckSelectionToBVC: true,
        environmentOrbit: true
      }
    };
    this.algorithmOptions = this.defaultOptions[algorithm];

    this.id = id;
    this.position = position;
    this.prevPosition = position;
    this.velocityScale = 1;
    this.goal = goal;
    this.tempGoal = null;
    this.radius = radius;
    this.envWidth = envWidth;
    this.envHeight = envHeight;
    this.scene = scene;
    this.engine = this.scene.engine;
    this.world = this.scene.world;
    this.VC = [];
    this.neighbors = [];

    // Create Matter.js body and attach it to world
    this.body = Bodies.circle(position.x, position.y, this.radius);
    this.body.friction = 0;
    this.body.frictionAir = 0;
    this.body.frictionStatic = 0;
    this.body.restitution = 0;
    World.add(this.world, this.body);

    // Motion Planning
    this.updateWaypoint = updateWaypoint(this);

    // Initialize velocity according to movement goal
    this.velocity = { x: 0, y: 0 };
    this.updateVelocity();

    // Goal Planning
    this.updateGoal = updateGoal(this);

    // Pucks
    this.nearbyPucks = [];
    this.bestPuck = null;

    // Obstacles
    this.obstacleSensingRadius = this.radius * 10;
  }

  setGoal(goal) {
    this.goal = goal;
  }

  setTempGoal(tempGoal) {
    this.tempGoal = tempGoal;
  }

  setBestPuck(puck) {
    this.bestPuck = puck;
  }

  timeStep() {
    this.prevPosition = this.position;
    this.position = this.body.position;
    this.updateGoal();
    this.limitGoal();
    this.updateVelocity();
  }

  updateVelocity() {
    this.setTempGoalInCell(this.BVC);
    this.setVelocityTo(this.tempGoal);
  }

  setVelocityTo(point) {
    // If goal point is reached (default)
    let newXVel = 0;
    let newYVel = 0;

    // else
    if (!this.reached(point)) {
      newXVel = this.velocityScale * (point.x - this.position.x);
      newYVel = this.velocityScale * (point.y - this.position.y);
    }

    this.velocity = { x: newXVel, y: newYVel };
    Body.setVelocity(this.body, { x: newXVel / 100, y: newYVel / 100 });
  }

  setTempGoalInCell(cell) {
    this.tempGoal = this.updateWaypoint(cell);
  }

  // Static Obstacles
  getNearbyObstacles() {
    const staticObstacles = [...this.scene.staticObjects.filter(
      (obj) => obj.getDistanceToBorder(this.position) < this.obstacleSensingRadius
    )];

    // Add pucks that reached goal as obstacles
    this.nearbyPucks.forEach((puck) => {
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
      (staticObs) => staticObs.getIntersectionPoint(this.position)
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

  closePolygon(poly) {
    if (!poly || poly.length < 2) {
      return poly;
    }

    const firstPoint = poly[0];
    const lastPoint = poly[poly.length - 1];

    if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
      poly.push(firstPoint);
    }

    return poly;
  }

  trimVCwithStaticObstacles() {
    // eslint-disable-next-line arrow-body-style
    const closestPoint = this.getClosestPointToNearbyObstacles();

    if (closestPoint == null) {
      return;
    }

    const secondLinePoint = shiftPointOfLineSegInDirOfPerpendicularBisector(
      closestPoint.x,
      closestPoint.y,
      closestPoint.x,
      closestPoint.y,
      this.position.x,
      this.position.y,
      1
    );

    const splittingLineParams = getLineEquationParams(closestPoint, secondLinePoint);
    const splitPolygonRes = splitPolygon(this.VC, splittingLineParams);
    const splitPolygonParts = [splitPolygonRes.positive, splitPolygonRes.negative];
    splitPolygonParts.map(
      (poly) => this.closePolygon(poly)
    );

    if (pointIsInsidePolygon(this.position, splitPolygonParts[0])) {
      this.VC = splitPolygonParts[0];
    } else {
      this.VC = splitPolygonParts[1];
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
    const ret = distanceBetween2Points(this.position, point);
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

  limitGoal() {
    const { radius } = this;
    const newGoal = {
      x: Math.min(Math.max(radius, this.goal.x), this.envWidth - radius),
      y: Math.min(Math.max(radius, this.goal.y), this.envHeight - radius)
    };

    this.scene.staticObjects.forEach((staticObj) => {
      let diffX = null;
      let diffY = null;
      while (!staticObj.pointIsReachableByRobot(newGoal, this)) {
        diffX = diffX || newGoal.x - this.position.x;
        diffY = diffY || newGoal.y - this.position.y;
        newGoal.x += diffX;
        newGoal.y += diffY;
      }
    });

    this.goal = newGoal;
  }

  collidingWithRobot(r) {
    return distanceBetween2Points(this.position, r.position) < this.radius * 2;
  }

  getNeighborRobotsDistanceMeasurements(robots) {
    let minDist = -1;

    robots.forEach((r) => {
      const distance = distanceBetween2Points(this.position, r.position);

      // If first or closest neighbor, set distanceas min distance
      if (minDist === -1 || distance < minDist) {
        minDist = distance;
      }
    });

    return { minDistance: minDist };
  }
}
