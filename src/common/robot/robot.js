import { Body, World, Bodies } from 'matter-js';

import { getDistance } from '../utils/geometry';

import SensorManager from './sensors/sensorManager';
import ActuatorManager from './actuators/actuatorsManager';

const SPEED_TYPES = {
  RELATIVE: 'RELATIVE',
  ABSOLUTE: 'ABSOLUTE'
};

const getController = (robot, controllerDef) => {
  let Func = null;
  let params = {};

  if (controllerDef && typeof controllerDef === 'function') {
    Func = controllerDef;
  } else if (controllerDef?.controller && typeof controllerDef.controller === 'function') {
    Func = controllerDef.controller;

    if (controllerDef.params && typeof controllerDef.params === 'object') {
      params = controllerDef.params;
    }
  }

  if (Func && typeof Func !== 'function') {
    throw new Error('Invalid controller', controllerDef);
  }

  return new Func(robot, params);
};

export default class Robot {
  constructor(
    id,
    position,
    goal,
    controllers,
    enabledSensors,
    enabledActuators,
    radius,
    envWidth,
    envHeight,
    scene,
    misc
  ) {
    // Configs
    this.DeadLockRecovery = {
      None: 0,
      Simple: 1,
      Advanced: 2
    };
    this.SPEED_TYPES = SPEED_TYPES;
    this.id = id;
    this.radius = radius;
    this.velocity = { x: 0, y: 0 };
    this.velocityScale = 1;
    this.goal = goal;
    this.waypoint = { x: position.x, y: position.y };
    this.envWidth = envWidth;
    this.envHeight = envHeight;
    this.scene = scene;
    this.engine = this.scene.engine;
    this.world = this.scene.world;

    // Add scene specific misc values to robots
    if (misc && typeof misc === 'object' && Object.keys(misc).length > 0) {
      Object.entries(misc).forEach(([miscKey, miscVal]) => { this[miscKey] = miscVal; });
    }

    // Create Matter.js body and attach it to world
    const compoundBody = Body.create({
      parts: [
        Bodies.circle(position.x, position.y, this.radius)
        // If you want to add more parts to the robot body, add them here.
        // Make sure to also change renderabes to render all parts of the robot.
        // Example of compound body:
        // ,
        // Bodies.polygon(
        //   position.x + this.radius / 10 + this.radius / 2,
        //   position.y - (2 * this.radius) / 5,
        //   3,
        //   this.radius * 1.2,
        //   { angle: (1.6 * Math.PI) / 2 }
        // )
      ]
    });
    this.body = compoundBody;
    this.body.friction = 0;
    this.body.frictionAir = 0;
    this.body.frictionStatic = 0;
    this.body.restitution = 0;
    this.body.angle = Math.random() * 2 * Math.PI; // Randomize orientations
    World.add(this.world, this.body);
    Body.setAngularVelocity(this.body, 1);
    this.engine.velocityIterations = 10;
    this.engine.positionIterations = 10;

    // Sensor Manager
    this.sensorManager = new SensorManager(this.scene, this, enabledSensors);
    this.sensorManager.start();
    this.sensorManager.update();

    // Actuator Manager
    this.actuatorManager = new ActuatorManager(this.scene, this, enabledActuators);
    this.actuators = this.actuatorManager.actuators;

    // Actuators Controller (actuator controller is optional)
    if (controllers.actuators) {
      this.actuate = getController(this, controllers.actuators);
    }

    // Goal Planning (goal controller is optional)
    if (controllers.goal) {
      this.updateGoal = getController(this, controllers.goal);
    }

    // Motion Planning (waypoint controller is optional)
    if (controllers.waypoint) {
      this.updateWaypoint = getController(this, controllers.waypoint);
    }

    // Velocities calculation
    this.updateVelocity = getController(this, controllers.velocity);

    this.sense = (sensorName, params) => this.sensorManager.sense(sensorName, params);

    this.sense.bind(this);
  }

  get sensors() {
    return this.sensorManager.values;
  }

  set position(val) {
    Body.set(this.body, 'position', { x: val.x, y: val.y });
    this.sensorManager.update();
  }

  setWaypoint(waypoint) {
    this.waypoint = { x: waypoint.x, y: waypoint.y };
  }

  timeStep() {
    // Update sensors
    this.sensorManager.update();

    // Update goal
    if (this.updateGoal && typeof this.updateGoal === 'function') {
      const newGoalRaw = this.updateGoal(this.sensors, this.actuators, this.goal);
      const newGoal = this.limitGoal(newGoalRaw);
      this.goal = newGoal;
    }

    // Update waypoint, according to new goal
    const newWaypoint = this.updateWaypoint && typeof this.updateWaypoint === 'function'
      ? this.updateWaypoint(this.sensors, this.actuators, this.goal)
      : this.goal;
    this.setWaypoint(newWaypoint);

    // Update velocities, according to new waypoint
    const velocities = this.updateVelocity(this.sensors, this.actuators, this.goal, newWaypoint);
    if (velocities.type === this.SPEED_TYPES.RELATIVE) {
      const theta = this.sensors.orientation;
      velocities.linearVel = {
        x: velocities.linearVel * Math.cos(theta),
        y: velocities.linearVel * Math.sin(theta)
      };
    }
    this.setVelocities(velocities);

    // Actuate
    if (this.actuate && typeof this.actuate === 'function') {
      this.actuate(this.sensors, this.actuators, this.goal, newWaypoint);
    }
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

  reached(point) {
    const ret = this.getDistanceTo(point) <= this.radius / 50;
    return ret;
  }

  getDistanceTo(point) {
    const ret = getDistance(this.sensors.position, point);
    return ret;
  }

  limitGoal(goal) {
    if (
      !this.sensors.position
      || !Number.isNaN(this.sensors.position.x)
      || !Number.isNaN(this.sensors.position.y)
    ) {
      return goal;
    }
    const { radius } = this;
    const newGoal = {
      x: Math.min(Math.max(radius, goal.x), this.envWidth - radius),
      y: Math.min(Math.max(radius, goal.y), this.envHeight - radius)
    };

    this.scene.staticObjects.forEach((staticObj) => {
      let diffX = null;
      let diffY = null;
      while (
        !Number.isNaN(this.sensors.position.x)
        && !Number.isNaN(this.sensors.position.y)
        && !staticObj.pointIsReachableByRobot(newGoal, this)
      ) {
        diffX = diffX || newGoal.x - this.sensors.position.x;
        diffY = diffY || newGoal.y - this.sensors.position.y;
        newGoal.x += diffX;
        newGoal.y += diffY;
      }
    });

    return newGoal;
  }

  // TODO: move to benchmark module
  getNeighborRobotsDistanceMeasurements(robots) {
    let minDist = null;

    robots.forEach((r) => {
      const distance = getDistance(this.sensors.position, r.sensors.position);

      // If first or closest neighbor, set distances min distance
      if (minDist === null || distance < minDist) {
        minDist = distance;
      }
    });

    return { minDistance: minDist };
  }
}