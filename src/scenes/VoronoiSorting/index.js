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

import goalController from './controllers/goalController';

const renderables = [
  { module: 'Scene', elements: SceneRenderables },
  { module: 'Puck', elements: PuckRenderables },
  { module: 'Robot', elements: RobotRenderables }
];

const supportedDynamicProps = [
  defaultDynamicPropertyDefinitions.robotCount,
  defaultDynamicPropertyDefinitions.velocityScale,
  {
    ...defaultDynamicPropertyDefinitions.pucksCountG1,
    max: 50
  },
  {
    ...defaultDynamicPropertyDefinitions.pucksCountG2,
    max: 50
  }
];

const supportedStaticProps = [
  {
    ...defaultStaticPropertyDefinitions.robotCount,
    max: 25
  },
  defaultStaticPropertyDefinitions.velocityScale,
  {
    ...defaultStaticPropertyDefinitions.robotRadius,
    min: 4,
    max: 12
  },
  {
    ...defaultStaticPropertyDefinitions.pucksCountG1,
    max: 50
  },
  {
    ...defaultStaticPropertyDefinitions.pucksRadiusG1,
    min: 8,
    max: 12
  },
  defaultStaticPropertyDefinitions.pucksGoalRadiusG1,
  {
    ...defaultStaticPropertyDefinitions.pucksCountG2,
    max: 50
  },
  {
    ...defaultStaticPropertyDefinitions.pucksRadiusG2,
    min: 8,
    max: 12
  },
  defaultStaticPropertyDefinitions.pucksGoalRadiusG2
];

const simConfig = {
  env: {
    width: 800,
    height: 500,
    renderSkip: 1
  },
  robots: {
    count: 20,
    radius: 7,
    params: {
      velocityScale: 15
    },
    controllers: {
      goal: {
        controller: goalController,
        params: {
          limitPuckSelectionToBVC: true,
          environmentOrbit: true
        }
      },
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
    groups: [
      {
        id: 0,
        count: 20,
        radius: 10,
        goal: { x: 150, y: 250 },
        goalRadius: 7 * 12,
        color: 'red'
      },
      {
        id: 1,
        count: 20,
        radius: 10,
        goal: { x: 650, y: 375 },
        goalRadius: 7 * 12,
        color: 'blue'
      }
    ],
    useGlobalPuckMaps: true
  },
  objects: [
    {
      type: 'rectangle',
      center: { x: 400, y: 100 },
      width: 50,
      height: 225
    },
    {
      type: 'rectangle',
      center: { x: 550, y: 225 },
      width: 350,
      height: 50
    },
    {
      type: 'rectangle',
      center: { x: 750, y: 100 },
      width: 350,
      height: 50
    },
    {
      type: 'circle',
      center: { x: 100, y: 150 },
      radius: 50,
      skipOrbit: true
    },
    {
      type: 'rectangle',
      center: { x: 350, y: 425 },
      width: 50,
      height: 150
    },
    {
      type: 'rectangle',
      center: { x: 250, y: 375 },
      width: 250,
      height: 50
    }
  ],
  positionsGenerator: CorePositionsGenerators.randomCollisionFree,
  renderables,
  dynamicPropertyDefinitions: supportedDynamicProps,
  staticPropertyDefinitions: supportedStaticProps
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
  maxTimeStep: 50000,
  timeStep: 1000
};

const description = {
  html: `
  <p>
    Object sorting using Buffered Voronoi Cells (BVC). 
    Each robot chooses an intermediate goal location within its BVC. 
    This avoids the possibility of collision or conflict with other robots. 
    Their goal is to incremental shift the pucks towards their respective goal locations.
  </p>

  <p>
    Rather than pushing pucks directly towards their goals, the robots make use of a goal map for each type of pucks. 
    A goal map specifies the direction a puck should be pushed in order to reach the goal, 
    accounting for obstacles that might be in the way.
  </p>

  <p>
    <a href=https://link.springer.com/chapter/10.1007/978-3-031-20176-9_27 target=_blank>
    Abdullhak, Mohammed, and Andrew Vardy. 
    "Distributed Sorting in Complex Environments." 
    Swarm Intelligence: 13th International Conference, ANTS 2022, Málaga, Spain, November 2–4, 2022, 
    Proceedings. Cham: Springer International Publishing, 2022.
    </a>
  </p>
  `
};

export default {
  title: 'Sorting (Voronoi)',
  name: 'voronoiSorting',
  simConfig,
  benchmarkConfig,
  description
};
