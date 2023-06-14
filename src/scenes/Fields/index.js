import {
  CoreActuators,
  CoreSensors,
  ExtraSensors,
  CorePositionsGenerators,
  CorePerformanceTrakers
} from '@common';

import SceneRenderables from '@common/scene/renderables';

import RobotRenderables from './robot/renderables';

import { controller, init } from './robot/controllers/controller';
import fieldDiffusion from './scene/fieldsDiffusion';

import mapUrl from './map.png';
import mapUrl2 from './map2.png';

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
  walls: {
    ...ExtraSensors.walls,
    params: {
      detectionRadius: 10
    }
  },
  fields: {
    ...ExtraSensors.fields,
    params: {
      // See the comments in FieldSensorExample for how to define points.
      points: [
        {
          type: 'Cartesian',
          name: 'forward',
          coords: {
            x: 1,
            y: 0
          }
        }
      ]
    }
  }
};

const simConfig = {
  env: {
    width: 600,
    height: 400,
    renderSkip: 1,
    fields: {
      heatMap: {
        url: mapUrl
      },
      field2: {
        url: mapUrl2,
        defaultBackground: true
      }
    },
    effects: [
      {
        func: fieldDiffusion,
        framesBetweenRuns: 2
      }
    ]
  },
  robots: {
    count: 10,
    radius: 5,
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
    // The neighbors sensor doesn't work unless the Voronoi diagram is used.
    useVoronoiDiagram: true,
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
  renderables
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
  trackers: [
    CorePerformanceTrakers.RobotToGoalDistanceTracker,
    CorePerformanceTrakers.MinRobotRobotDistanceTracker
  ],
  maxTimeStep: 20000,
  timeStep: 1000
};

const description = {
  html: `<p>This will be used for showing field manipulation / whatever algorithm will use it.</p>
  `
};

export default {
  title: 'Field Manipulation Demo',
  name: 'fieldManipulation',
  simConfig,
  benchmarkConfig,
  description
};
