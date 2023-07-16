import {
  CoreSensors,
  CoreActuators,
  ExtraSensors,
  CorePositionsGenerators,
  defaultDynamicPropertyDefinitions,
  defaultStaticPropertyDefinitions
} from '@common';

import SceneRenderables from '@common/scene/renderables';

import RobotRenderables from './robot/renderables';

import { init, controller } from './robot/controllers/controller';
import fieldEffects from './scene/fieldEffects';

// eslint-disable-next-line import/no-duplicates
import pheromoneUrl from './black.png';
// eslint-disable-next-line import/no-duplicates
import occupancyUrl from './black.png';

// All renderables should be registered in this list and assigned a module property
// This is necessary to avoid imposing a unique restriction on renderable type in different modules
// So if both robots and pucks have 'body' type renderables, they can still be treated as separate
// types and be disabled/enabled independently from the UI while also having a readable name
// There could be a cleaner way to do this, but it works for now
// Ordering is also important, as it determines which elements are shown on top
// Elements defined last are shown on top
const renderables = [
  { module: 'Scene', elements: SceneRenderables },
  { module: 'Robot', elements: [...RobotRenderables] }
];

const usedSensors = {
  ...CoreSensors,
  fields: {
    ...ExtraSensors.fields,
    params: {
      // We can define points relative to a robot located at (0, 0) headed along positive X axis
      // With Cartesian coordinates forward is [1, 0], back: [-1, 0], left: [0, 1], right: [0, -1]
      // With Polar coordinates (positive angles are clockwise)
      // forward is [1, 0], back: [1, PI], left: [1, -(PI / 2)], right: [1, PI / 2]
      points: [
        {
          type: 'Cartesian',
          name: 'left',
          coords: {
            x: 20,
            y: 5
          }
        },
        {
          type: 'Cartesian',
          name: 'right',
          coords: {
            x: 20,
            y: -5
          }
        }
      ]
    }
  },
  circles: {
    ...ExtraSensors.circles,
    params: {
      regions: [
        {
          name: 'left',
          centre: { type: 'Polar', name: '0', coords: { distance: 22, angle: (-Math.PI / 4.0) } },
          radius: 6,
          sensedTypes: ['robots', 'walls']
        },
        {
          name: 'right',
          centre: { type: 'Polar', name: '0', coords: { distance: 22, angle: (Math.PI / 4.0) } },
          radius: 6,
          sensedTypes: ['robots', 'walls']
        }
      ]
    }
  }
};

const supportedDynamicProps = [
  defaultDynamicPropertyDefinitions.robotCount
];

const supportedStaticProps = [
  {
    ...defaultStaticPropertyDefinitions.robotCount,
    max: 20
  },
  defaultStaticPropertyDefinitions.robotRadius
];

const simConfig = {
  env: {
    width: 600,
    height: 400,
    renderSkip: 1,
    fields: {
      pheromone: {
        url: pheromoneUrl,
        defaultBackground: true,
        title: 'Pheromone'
      },
      occupancy: {
        url: occupancyUrl,
        title: 'Occupancy'
      }
    },
    effects: [
      {
        func: fieldEffects,
        framesBetweenRuns: 10
      }
    ]
  },
  robots: {
    count: 7,
    radius: 15,
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
    actuators: [CoreActuators.field],
    useVoronoiDiagram: false,
    misc: {
      // EXAMPLE: passing misc objects from config to robots (has to be under 'misc' key)
      sceneSpecificMap: 'test'
    }
  },
  pucks: {
    groups: [],
    useGlobalPuckMaps: false
  },
  objects: [],
  positionsGenerator: CorePositionsGenerators.randomCollisionFree,
  renderables,
  dynamicPropertyDefinitions: supportedDynamicProps,
  staticPropertyDefinitions: supportedStaticProps
};

// Define benchmark configurations:
// - timeStep: minimum reported time step, will be used as the time unit in the graphs
// - maxTimeStep: length of each simulation run
// - trackers: list of objects that provide a function to calculate a performance metric at
//        each simulation update along with functions for readucing and aggregating values.
//        Tracker (@common/benchmarking/performanceTrackers/tracker) can be used as a
//        reference and extended as it provides most of the needed functionalities.
//        Each tracker will result in a graph in the performance graphs tab
// - simConfigs: list of simulation configurations that will be compared against each others
//        across multiple runs using the performance metrics provided by the trackers.
//        - name: a unique name that will be used to reference this config in the graphs legends
//        - simConfig: all the changes from main config that will be applied to this simulation
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
  trackers: [],
  maxTimeStep: 20000,
  timeStep: 1000
};

const description = {
  html: `
  <p>
    A demo scene to illustrate how the robots can perceive and manipulate fields.
    These fields could be temperature, pheromone level, or any other such scalar field.
    In this case, there is a pheromone field that the robots can sense and manipulate.
    There is also an occupancy field which they have no awareness of, 
    which could be used to track where their time is spent.
  </p>
  
  <p>
    The controller used is inspired by the 
    <a href=http://meyleankronemann.de/lumibots target=_black>Lumibots project</a>.
    In essence, there are two rules: avoid obstacles and turn towards the strongest pheromone.
  </p>
  
  <a href=https://dl.acm.org/doi/abs/10.1145/1858171.1858249 target=_blank>
    Kronemann, Mey Lean, and Verena V. Hafner. "Lumibots: making emergence graspable in a swarm of robots."
    Proceedings of the 8th ACM Conference on Designing Interactive Systems. 2010.
  </a>
  `
};

export default {
  title: 'Fields Demo',
  name: 'fieldsDemo',
  simConfig,
  benchmarkConfig,
  description
};
