import { Body, World, Bodies } from 'matter-js';

import { getDistance } from '../utils/geometry';

import updateVelocity from './controllers/velocityController';
import updateWaypoint from './controllers/waypointController';
import updateGoal from './controllers/goalController';

import SensorManager from './sensors/sensorManager';
import ActuatorManager from './actuators/actuatorsManager';

export default class Robot {
  constructor(
    id,
    position,
    goal,
    enabledSensors,
    enabledActuators,
    radius,
    envWidth,
    envHeight,
    scene,
    algorithm
  ) {
    // Configs
    this.DeadLockRecovery = {
      None: 0,
      Simple: 1,
      Advanced: 2
    };
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
    World.add(this.world, this.body);
    Body.setAngularVelocity(this.body, 1);

    // Sensor Manager
    this.sensorManager = new SensorManager(this.scene, this, enabledSensors);
    this.sensorManager.start();

    // Actuator Manager
    this.actuatorManager = new ActuatorManager(this.scene, this, enabledActuators);
    this.actuators = this.actuatorManager.actuators;

    // Velocities calculation strategy
    this.updateVelocity = updateVelocity(this);

    // Motion Planning
    this.updateWaypoint = updateWaypoint(this);

    // Goal Planning
    this.updateGoal = updateGoal(radius, envWidth, envHeight, this.sensors.envBounds, algorithm);

    this.sense = (sensorName, params) => this.sensorManager.sense(sensorName, params);

    this.changeAlgorithm = (newAlgorithm) => {
      this.algorithmOptions = this.availableAlgorithms.find((a) => a.name === newAlgorithm);
    };

    this.sense.bind(this);
    this.changeAlgorithm.bind(this);
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
    const newGoalRaw = this.updateGoal(this.goal, this.sensors, this.actuators);
    const newGoal = this.limitGoal(newGoalRaw);
    this.goal = newGoal;

    // Update waypoint, according to new goal
    const newWaypoint = this.updateWaypoint(this.goal, this.sensors, this.actuators);
    this.setWaypoint(newWaypoint);

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

  reached(point) {
    const ret = this.getDistanceTo(point) <= this.radius / 50;
    return ret;
  }

  getDistanceTo(point) {
    const ret = getDistance(this.sensors.position, point);
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
    let minDist = -1;

    robots.forEach((r) => {
      const distance = getDistance(this.sensors.position, r.sensotValues.position);

      // If first or closest neighbor, set distances min distance
      if (minDist === -1 || distance < minDist) {
        minDist = distance;
      }
    });

    return { minDistance: minDist };
  }
}

// Define and export renderables
// ===============================
// This is where we define renderables in a simple config format
// We should also import and register the renderables into renderering module (renderer.js)
// This maybe more suitable to be in a separate file,
// but for now I'm keeping each module's renderables in the same file
// Some of the syntax might not be very clean, such as requiring knowing where stuff are defined
// and stored within the Scene and defining them with a sceneProp, but I think it's fine for now

// Example of rendering a compound body
// const compoundBodyRenderables = [
//   {
//     type: 'Body',
//     dataPoints: { sceneProp: 'robots' },
//     shape: 'circle',
//     staticAttrs: {
//       r: { prop: 'radius' },
//       id: { prop: 'id' }
//     },
//     dynamicAttrs: {
//       cx: { prop: 'body.parts[1].position.x' },
//       cy: { prop: 'body.parts[1].position.y' }
//     },
//     styles: {
//       fill: '#FFC53A',
//       'stroke-width': 1,
//       'stroke-opacity': 1,
//       'fill-opacity': 1
//     },
//     drag: {
//       prop: 'position',
//       pause: true,
//       onStart: {
//         styles: {
//           stroke: 'green'
//         },
//         log: [
//           { prop: 'sensors' }
//         ]
//       },
//       onEnd: {
//         styles: {
//           stroke: 'black'
//         }
//       }
//     }
//   },
//   {
//     type: 'Body',
//     dataPoints: { sceneProp: 'robots' },
//     shape: 'polygon',
//     staticAttrs: {
//     },
//     dynamicAttrs: {
//       points: {
//         prop: 'body.parts[2].vertices',
//         modifier: (vertices) => vertices.map((p) => `${p.x},${p.y}`).join(' ')
//       }
//     },
//     styles: {
//       fill: '#FFC53A',
//       'stroke-width': 1,
//       'stroke-opacity': 1,
//       'fill-opacity': 1
//     },
//     drag: {
//       prop: 'position',
//       pause: true,
//       onStart: {
//         styles: {
//           stroke: 'green'
//         },
//         log: [
//           { prop: 'sensors' }
//         ]
//       },
//       onEnd: {
//         styles: {
//           stroke: 'black'
//         }
//       }
//     }
//   }
// ];

const bodyRenderables = [
  {
    type: 'Body',
    dataPoints: { sceneProp: 'robots' },
    shape: 'circle',
    staticAttrs: {
      r: { prop: 'radius' },
      id: { prop: 'id' }
    },
    dynamicAttrs: {
      cx: { prop: 'sensors.position.x' },
      cy: { prop: 'sensors.position.y' }
    },
    styles: {
      fill: '#FFC53A',
      stroke: 'black',
      'stroke-width': 1,
      'stroke-opacity': 1,
      'fill-opacity': 1
    },
    drag: {
      prop: 'position',
      pause: true,
      onStart: {
        styles: {
          stroke: 'green'
        },
        log: [
          { prop: 'sensors' }
        ]
      },
      onEnd: {
        styles: {
          stroke: 'black'
        }
      }
    }
  },
  {
    type: 'Body',
    name: 'robotOrientations',
    desc: 'Line segments between robots and headings',
    dataPoints: { sceneProp: 'robots' },
    shape: 'path',
    staticAttrs: {
      id: { prop: 'id' }
    },
    dynamicAttrs: {
      points: [
        { prop: 'sensors.position' },
        { prop: 'sensors.heading' }
      ]
    },
    styles: {
      fill: 'none',
      stroke: 'black',
      'stroke-width': 3,
      'stroke-opacity': 1,
      'fill-opacity': 1
    }
  }
];

const waypointRenderables = [
  {
    type: 'Waypoint',
    dataPoints: { sceneProp: 'robots' },
    shape: 'circle',
    staticAttrs: {
      r: {
        prop: 'radius',
        modifier: (val) => val / 1.5
      },
      id: { prop: 'id' }
    },
    dynamicAttrs: {
      cx: { prop: 'waypoint.x' },
      cy: { prop: 'waypoint.y' }
    },
    styles: {
      fill: { special: 'schemaColor' },
      stroke: { special: 'schemaColor' },
      'stroke-dasharray': '1,1',
      'stroke-width': 1,
      'stroke-opacity': 1,
      'fill-opacity': 0.4
    }
  },
  {
    type: 'Waypoint',
    name: 'robotToWaypointLineSegs',
    desc: 'Line segments between robots and waypoints',
    dataPoints: { sceneProp: 'robots' },
    shape: 'path',
    staticAttrs: {
      id: { prop: 'id' }
    },
    dynamicAttrs: {
      points: [
        { prop: 'sensors.position' },
        { prop: 'waypoint' }
      ]
    },
    styles: {
      fill: 'none',
      stroke: { special: 'schemaColor' },
      'stroke-dasharray': '1,10',
      'stroke-width': 1,
      'stroke-opacity': 1,
      'fill-opacity': 1
    }
  },
  {
    type: 'Waypoint',
    name: 'waypointToGoalLineSegs',
    desc: 'Line segments between waypoints and goals',
    dataPoints: { sceneProp: 'robots' },
    shape: 'path',
    staticAttrs: {
      id: { prop: 'id' }
    },
    dynamicAttrs: {
      points: [
        { prop: 'waypoint' },
        { prop: 'goal' }
      ]
    },
    styles: {
      fill: 'none',
      stroke: { special: 'schemaColor' },
      'stroke-dasharray': '1,10',
      'stroke-width': 1,
      'stroke-opacity': 1,
      'fill-opacity': 1
    }
  }
];

const goalRenderables = [
  {
    type: 'Goal',
    dataPoints: { sceneProp: 'robots' },
    shape: 'circle',
    staticAttrs: {
      r: {
        prop: 'radius',
        modifier: (val) => val / 2
      },
      id: { prop: 'id' }
    },
    dynamicAttrs: {
      cx: { prop: 'goal.x' },
      cy: { prop: 'goal.y' }
    },
    styles: {
      fill: { special: 'schemaColor' },
      stroke: 'white',
      'stroke-dasharray': '0.5,0.5',
      'stroke-width': 1,
      'stroke-opacity': 1,
      'fill-opacity': 1
    },
    drag: {
      prop: 'goal',
      pause: true,
      onStart: {
        styles: {
          stroke: 'black'
        },
        log: [
          { prop: 'sensors' }
        ]
      },
      onEnd: {
        styles: {
          stroke: 'lightgray'
        }
      }
    }
  },
  {
    type: 'Goal',
    name: 'robotToGoalLineSegs',
    desc: 'Line segments between robots and goals',
    dataPoints: { sceneProp: 'robots' },
    shape: 'path',
    staticAttrs: {
      id: { prop: 'id' }
    },
    dynamicAttrs: {
      points: [
        { prop: 'sensors.position' },
        { prop: 'goal' }
      ]
    },
    styles: {
      fill: 'none',
      stroke: { special: 'schemaColor' },
      'stroke-dasharray': '10,10',
      'stroke-width': 1,
      'stroke-opacity': 1,
      'fill-opacity': 1
    }
  }
];

const vornoiRenderables = [
  {
    type: 'VC',
    name: 'VcMeshBG',
    desc: 'Vodonoi Diagram Background',
    shape: 'path',
    dynamicAttrs: {
      d: { sceneProp: 'voronoiMesh' }
    },
    styles: {
      stroke: '#777',
      'stroke-width': 2,
      'stroke-opacity': 1
    }
  },
  {
    type: 'VC',
    name: 'VcMesh',
    desc: 'Vodonoi Diagram',
    shape: 'path',
    dynamicAttrs: {
      d: { sceneProp: 'voronoiMesh' }
    },
    styles: {
      stroke: '#000',
      'stroke-width': 1,
      'stroke-opacity': 1
    }
  },
  {
    type: 'BVC',
    name: 'BVCMesh',
    desc: 'Buffered Vodonoi Diagram',
    shape: 'path',
    dataPoints: { sceneProp: 'robots' },
    dynamicAttrs: {
      points: { prop: 'sensors.BVC' }
    },
    styles: {
      fill: 'none',
      stroke: { special: 'schemaColor' },
      'stroke-dasharray': '10,10',
      'stroke-width': 1,
      'stroke-opacity': 1
    }
  }
];

export const RobotRenderables = [
  ...bodyRenderables,
  ...waypointRenderables,
  ...goalRenderables,
  ...vornoiRenderables
];
