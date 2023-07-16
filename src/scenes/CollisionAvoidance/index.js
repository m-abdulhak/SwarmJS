import {
  CoreActuators,
  CoreSensors,
  ExtraSensors,
  CorePositionsGenerators,
  CorePerformanceTrackers,
  CoreControllers,
  defaultDynamicPropertyDefinitions,
  defaultStaticPropertyDefinitions
} from '@common';

import SceneRenderables from '@common/scene/renderables';
import RobotRenderables from '@common/robot/renderables';
import PuckRenderables from '@common/puck/renderables';

const renderables = [
  { module: 'Scene', elements: SceneRenderables },
  { module: 'Puck', elements: PuckRenderables },
  { module: 'Robot', elements: RobotRenderables }
];

const supportedDynamicProps = [
  defaultDynamicPropertyDefinitions.robotCount,
  defaultDynamicPropertyDefinitions.velocityScale
];

const supportedStaticProps = [
  defaultStaticPropertyDefinitions.envWidth,
  defaultStaticPropertyDefinitions.envHeight,
  {
    ...defaultStaticPropertyDefinitions.robotCount,
    max: 30
  },
  {
    ...defaultStaticPropertyDefinitions.robotRadius,
    max: 15
  }
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
  renderables,
  dynamicPropertyDefinitions: supportedDynamicProps,
  staticPropertyDefinitions: supportedStaticProps
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
    CorePerformanceTrackers.RobotToGoalDistanceTracker,
    CorePerformanceTrackers.PucksOutsideGoalTracker,
    CorePerformanceTrackers.MinRobotRobotDistanceTracker
  ],
  maxTimeStep: 50000,
  timeStep: 1000
};

const description = {
  html: `
  <p>
    Distributed collision avoidance algorithm based on the concept of Buffered Voronoi Cells (BVC).
    This novel algorithm predicts and avoids deadlock configurations. 
    In this scene, the robots try to reach the opposite point on the circle from where they started.
  </p>

  <p>
    This scene allows you to interact with both the robots and their goals.
    Each robot has a corresponding goal (small circle) and waypoint (slightly larger circle with a dotted outline).
    You can click-and-drag either the robots or their goals.
  </p> 

  <p>
    <a href=https://ieeexplore.ieee.org/document/9636609 target=_blank>
      Abdullhak, Mohammed, and Andrew Vardy.
      "Deadlock prediction and recovery for distributed collision avoidance with buffered voronoi cells."
      2021 IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS). IEEE, 2021.
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
