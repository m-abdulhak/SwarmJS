import {
  CoreSensors,
  ExtraSensors,
  CorePositionsGenerators,
  defaultDynamicPropertyDefinitions,
  defaultStaticPropertyDefinitions
} from '@common';

import SceneRenderables from '@common/scene/renderables';
import PuckRenderables from '@common/puck/renderables';
import LocalRenderables from './robot/renderables';

import { init, controller } from './robot/controllers/controller';

import PercentageCompletionTracker from '../DensityCluster/benchmarking/percentageCompletionTracker';

const renderables = [
  { module: 'Scene', elements: SceneRenderables },
  { module: 'Puck', elements: PuckRenderables },
  { module: 'Local', elements: [...LocalRenderables] }
];

const usedSensors = {
  ...CoreSensors,
  polygons: {
    ...ExtraSensors.polygons,
    params: {
      // See the comments in FieldSensorExample for how to define points.
      regions:
            [
              {
                name: 'left',
                vertices: [
                  { type: 'Polar', name: '0', coords: { distance: 100, angle: (-0.25 * Math.PI) / 2 } },
                  { type: 'Polar', name: '1', coords: { distance: 100, angle: (0.0 * Math.PI) / 2 } },
                  { type: 'Cartesian', name: 'bottomRight', coords: { x: 0, y: 5 } }
                ],
                sensedTypes: ['pucks', 'robots']
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
  defaultStaticPropertyDefinitions.robotCount,
  defaultStaticPropertyDefinitions.velocityScale,
  {
    ...defaultStaticPropertyDefinitions.robotRadius,
    min: 4,
    max: 8
  },
  defaultStaticPropertyDefinitions.pucksCountG1,
  {
    ...defaultStaticPropertyDefinitions.pucksRadiusG1,
    min: 8,
    max: 12
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
    radius: 4,
    params: {
      velocityScale: 15
    },
    controllers: {
      velocity: {
        init,
        controller
      }
    },
    sensors: [...Object.values(usedSensors)],
    actuators: [],
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
        count: 100,
        radius: 8,
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
          count: 5
        }
      }
    },
    {
      name: '30 Robots',
      simConfig: {
        env: {
          renderSkip: 50
        },
        robots: {
          count: 30
        }
      }
    }
  ],
  trackers: [
    new PercentageCompletionTracker()
  ],
  maxTimeStep: 20000,
  timeStep: 100
};

const description = {
  html: `
  <p>
    Self-organized object clustering.  Each robot has a single sensor which can detect pucks. 
    If a puck lies in the sensor region, the robot veers left. 
    Otherwise, it veers right.  That's it!
  </p>

  <p>This controller is inspired by the following paper:</p>

  <p>
    <a href=https://dl.acm.org/doi/10.5555/2615731.2615800 target=_blank>
      Gauci, Melvin, et al. "Clustering objects with robots that do not compute." 
      Proceedings of the 2014 international conference on Autonomous agents and multi-agent systems. 2014.
    </a>
  </p>
  `
};

export default {
  title: 'Cluster (Periphery)',
  name: 'peripheryCluster',
  simConfig,
  benchmarkConfig,
  description
};
