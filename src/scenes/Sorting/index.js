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
import CoreRobotRenderables from '@common/robot/renderables';
import PuckRenderables from '@common/puck/renderables';

import RobotRenderables from './robot/renderables';

import actuatorController from './robot/controllers/actuatorController';
import goalController from './robot/controllers/goalController';

// All renderables should be registered in this list and assigned a module property
// This is necessary to avoid imposing a unique restriction on renderable type in different modules
// So if both robots and pucks have 'body' type renderables, they can still be treated as separate
// types and be disabled/enabled independently from the UI while also having a readable name
// There could be a cleaner way to do this, but it works for now
// Ordering is also important, as it determines which elements are shown on top
// Elements defined last are shown on top
const renderables = [
  { module: 'Scene', elements: SceneRenderables },
  { module: 'Puck', elements: PuckRenderables },
  { module: 'Robot', elements: [...CoreRobotRenderables, ...RobotRenderables] }
];

const supportedDynamicProps = [
  defaultDynamicPropertyDefinitions.robotCount,
  defaultDynamicPropertyDefinitions.velocityScale,
  defaultDynamicPropertyDefinitions.pucksCountG1,
  defaultDynamicPropertyDefinitions.pucksCountG2
];

const simConfig = {
  env: {
    width: 800,
    height: 500,
    renderSkip: 1
  },
  robots: {
    count: 10,
    radius: 10,
    params: {
      velocityScale: 15
    },
    controllers: {
      actuators: actuatorController,
      goal: goalController,
      velocity: {
        controller: CoreControllers.velocity.diffVelocityController,
        params: { angularVelocityScale: 0.001 }
      },
      supportsUserDefinedControllers: false
    },
    sensors: [...Object.values(CoreSensors), ...Object.values(ExtraSensors)],
    actuators: [CoreActuators.grabber],
    useVoronoiDiagram: false,
    misc: {
      // EXAMPLE: passing misc objects from config to robots (has to be under 'misc' key)
      sceneSpecificMap: 'test'
    }
  },
  pucks: {
    groups: [
      {
        id: 0,
        count: 20,
        radius: 7,
        goal: { x: 150, y: 250 },
        goalRadius: 7 * 12,
        color: 'red'
      },
      {
        id: 1,
        count: 20,
        radius: 7,
        goal: { x: 650, y: 375 },
        goalRadius: 7 * 12,
        color: 'blue'
      }
    ],
    useGlobalPuckMaps: false
  },
  objects: [],
  positionsGenerator: CorePositionsGenerators.randomCollisionFree,
  renderables,
  dynamicPropertyDefinitions: supportedDynamicProps,
  staticPropertyDefinitions: Object.values(defaultStaticPropertyDefinitions)
};

const benchmarkConfig = {
  simConfigs: [
    {
      name: '5 Robots',
      simConfig: {
        env: {
          renderSkip: 50
        },
        robots: {
          count: 5,
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
  maxTimeStep: 20000,
  timeStep: 1000
};

const description = {
  html: `
  <p>
    Object sorting using a very straightforward strategy. Move forward, turning only to avoid a wall. 
    If not carrying a puck and one is encountered, pick it up.
    If the robot happens to reach the puck's goal, drop it.
  </p>

  <p>
    This is not a particularly effective algorithm, but rather exists for benchmarking or 
    comparison with other approaches such as <b>Voronoi Sorting</b>.
  </p>
  `
};

export default {
  title: 'Sorting (Sorting)',
  name: 'simpleSorting',
  simConfig,
  benchmarkConfig,
  description
};
