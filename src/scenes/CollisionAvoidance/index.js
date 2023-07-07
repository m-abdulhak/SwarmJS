import {
  CoreActuators,
  CoreSensors,
  ExtraSensors,
  CorePositionsGenerators,
  CorePerformanceTrakers,
  CoreControllers
} from '@common';

import SceneRenderables from '@common/scene/renderables';
import RobotRenderables from '@common/robot/renderables';
import PuckRenderables from '@common/puck/renderables';

const renderables = [
  { module: 'Scene', elements: SceneRenderables },
  { module: 'Puck', elements: PuckRenderables },
  { module: 'Robot', elements: RobotRenderables }
];

const simConfig = {
  env: {
    width: 800,
    height: 500,
    renderSkip: 1
  },
  robots: {
    count: 20,
    radius: 10,
    params: {
      velocityScale: 10
    },
    controllers: {
      waypoint: CoreControllers.waypoint.bvcWaypointController,
      // velocity: CoreControllers.velocity.omniDirVelocityController
      velocity: {
        controller: CoreControllers.velocity.diffVelocityController,
        params: { angularVelocityScale: 0.01 }
      },
      supportsUserDefinedControllers: false
    },
    sensors: [...Object.values(CoreSensors), ...Object.values(ExtraSensors)],
    actuators: Object.values(CoreActuators),
    useVoronoiDiagram: true
  },
  pucks: {
    groups: [],
    useGlobalPuckMaps: false
  },
  objects: [],
  positionsGenerator: CorePositionsGenerators.circularPositionsGenerator,
  renderables
};

// TODO: add other waypoint controller to benchmark
const benchmarkConfig = {
  simConfigs: [
    {
      name: '10 Robots',
      simConfig: {
        env: {
          renderSkip: 50
        },
        robots: {
          count: 10,
          params: {
            velocityScale: 50
          }
        }
      }
    },
    {
      name: '20 Robots',
      simConfig: {
        env: {
          renderSkip: 50
        },
        robots: {
          params: {
            velocityScale: 50
          }
        }
      }
    }
  ],
  trackers: [
    CorePerformanceTrakers.RobotToGoalDistanceTracker,
    CorePerformanceTrakers.PucksOutsideGoalTracker,
    CorePerformanceTrakers.MinRobotRobotDistanceTracker
  ],
  maxTimeStep: 50000,
  timeStep: 1000
};

const description = {
  html: `<p>Distributed collision avoidance algorithm based on the concept of Buffered Voronoi Cells (BVC). This novel algorithm predicts and avoids deadlock configurations.</p>

  <p>In this experiment, the robots each try to reach the opposite point on the circle from which they begin.</p>

  <p>
  <a href=https://ieeexplore.ieee.org/document/9636609 target=_blank>
  Abdullhak, Mohammed, and Andrew Vardy. "Deadlock prediction and recovery for distributed collision avoidance with buffered voronoi cells." 2021 IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS). IEEE, 2021.
  </a>
  </p>
  `
};

export default {
  title: 'Collision Avoidance',
  name: 'collisionAvoidance',
  simConfig,
  benchmarkConfig,
  description
};
