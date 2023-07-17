import {
  CoreActuators,
  CoreSensors,
  ExtraSensors,
  CorePositionsGenerators,
  defaultDynamicPropertyDefinitions,
  defaultStaticPropertyDefinitions
} from '@common';

import SceneRenderables from '@common/scene/renderables';
import PuckRenderables from '@common/puck/renderables';
import RobotRenderables from './robot/renderables';

import { init, controller } from './robot/controllers/controller';

import PercentageCompletionTracker from './benchmarking/percentageCompletionTracker';

const renderables = [
  { module: 'Scene', elements: SceneRenderables },
  { module: 'Puck', elements: PuckRenderables },
  { module: 'Robot', elements: [...RobotRenderables] }
];

const usedSensors = {
  ...CoreSensors,
  nearbyPucks: { ...ExtraSensors.nearbyPucks },
  closestPuckToGrabber: { ...ExtraSensors.closestPuckToGrabber },
  pucksNearGrabber: { ...ExtraSensors.pucksNearGrabber },
  circles: {
    ...ExtraSensors.circles,
    params: {
      regions: [
        {
          name: 'left',
          centre: { type: 'Polar', name: '0', coords: { distance: 15, angle: (-Math.PI / 4.0) } },
          radius: 5,
          sensedTypes: ['walls', 'robots']
        },
        {
          name: 'right',
          centre: { type: 'Polar', name: '0', coords: { distance: 15, angle: (Math.PI / 4.0) } },
          radius: 5,
          sensedTypes: ['walls', 'robots']
        }
      ]
    }
  },
  polygons: {
    ...ExtraSensors.polygons,
    params: {
      regions:
            [
              {
                name: 'inner',
                vertices: [
                  { type: 'Cartesian', name: '0', coords: { y: -10, x: 15 } },
                  { type: 'Cartesian', name: '1', coords: { y: -10, x: 25 } },
                  { type: 'Cartesian', name: '2', coords: { y: 10, x: 25 } },
                  { type: 'Cartesian', name: '3', coords: { y: 10, x: 15 } }
                ],
                sensedTypes: ['pucks']
              },
              {
                name: 'outer',
                vertices: [
                  { type: 'Cartesian', name: '0', coords: { y: -20, x: 30 } },
                  { type: 'Cartesian', name: '1', coords: { y: -20, x: 40 } },
                  { type: 'Cartesian', name: '2', coords: { y: 20, x: 40 } },
                  { type: 'Cartesian', name: '3', coords: { y: 20, x: 30 } }
                ],
                sensedTypes: ['pucks']
              }
            ]
    }
  }
};

const supportedDynamicProps = [
  defaultDynamicPropertyDefinitions.robotCount,
  defaultDynamicPropertyDefinitions.velocityScale,
  defaultDynamicPropertyDefinitions.pucksCountG1
];

const supportedStaticProps = [
  defaultStaticPropertyDefinitions.envWidth,
  defaultStaticPropertyDefinitions.envHeight,
  defaultStaticPropertyDefinitions.robotCount,
  defaultStaticPropertyDefinitions.velocityScale,
  {
    ...defaultStaticPropertyDefinitions.robotRadius,
    min: 8
  },
  defaultStaticPropertyDefinitions.pucksCountG1,
  {
    ...defaultStaticPropertyDefinitions.pucksRadiusG1,
    max: 6
  }
];

const simConfig = {
  env: {
    width: 600,
    height: 400,
    renderSkip: 1
  },
  robots: {
    count: 10,
    radius: 10,
    params: {
      velocityScale: 15
    },
    controllers: {
      velocity: {
        init,
        controller,
        params: { angularVelocityScale: 0.001 }
      }
    },
    sensors: [...Object.values(usedSensors)],
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
        count: 50,
        radius: 4,
        color: 'red'
      }
    ],
    useGlobalPuckMaps: false
  },
  objects: [],
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
    new PercentageCompletionTracker()
  ],
  maxTimeStep: 20000,
  timeStep: 1000
};

const description = {
  html: `
  <p>
    An example of self-organized clustering based on local object <b>density</b>.
    Each robot can sense pucks in two sensor regions (inner and outer) and choose to pick-up 
    or deposit pucks depending on whether they are in a low-density or high-density region 
    (i.e. there are few pucks, or many pucks).
  </p>
  
  <p>Loosely inspired by the following classic paper:</p>

  <p>
    <a href=https://link.springer.com/chapter/10.1007/978-94-010-0870-9_63 target=_blank>
      Beckers, Ralph, Owen E. Holland, and Jean-Louis Deneubourg. 
      "Fom local actions to global tasks: Stigmergy and collective robotics." 
      Prerational Intelligence: Adaptive Behavior and Intelligent Systems Without Symbols and Logic, 
      Volume 1, Volume 2 Prerational Intelligence: 
      Interdisciplinary Perspectives on the Behavior of Natural and Artificial Systems, Volume 3 (2000): 1008-1022.
    </a>
  </p>
  `
};

export default {
  title: 'Cluster (Density)',
  name: 'densityCluster',
  simConfig,
  benchmarkConfig,
  description
};
