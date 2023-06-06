import {
  CoreSensors,
  ExtraSensors,
  CorePositionsGenerators
} from '@common';

import SceneRenderables from '@common/scene/renderables';

import RobotRenderables from './robot/renderables';

import controller from './robot/controllers/controller';

import DistanceToGoalTracker from './benchmarking/distanceToGoalTracker';

import mapUrl from './map.png';

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
  circles: {
    ...ExtraSensors.circles,
    params: {
      regions: [
        {
          name: 'ahead',
          centre: { type: 'Polar', name: '0', coords: { distance: 12, angle: 0 } },
          radius: 6,
          sensedTypes: ['robots']
        },
        {
          name: 'left',
          centre: { type: 'Polar', name: '0', coords: { distance: 8, angle: (- Math.PI / 4.0) } },
          radius: 3,
          sensedTypes: ['walls']
        },
        {
          name: 'right',
          centre: { type: 'Polar', name: '0', coords: { distance: 8, angle: (Math.PI / 4.0) } },
          radius: 3,
          sensedTypes: ['walls']
        },
      ]
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
    speed: 15,
    renderSkip: 1,
    background: mapUrl,
    fields: {
      heatMap: {
        url: mapUrl
      }
    }
  },
  robots: {
    count: 50,
    radius: 5,
    controllers: {
      velocity: {
        controller,
        params: { angularVelocityScale: 0.001 }
      }
    },
    sensors: [...Object.values(usedSensors)],
    actuators: [],
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
      name: 'theta = 0.001',
      simConfig: {
        robots: {
          controllers: {
            velocity: {
              controller,
              params: { theta: 0.001 }
            }
          }
        }
      }
    },
    {
      name: 'theta = 0.01',
      simConfig: {
        robots: {
          controllers: {
            velocity: {
              controller,
              params: { theta: 0.01 }
            }
          }
        }
      }
    }
  ],
  trackers: [ DistanceToGoalTracker ],
  maxTimeStep: 20000,
  timeStep: 100
};

export default {
  title: 'BEEClust',
  name: 'beeClust',
  simConfig,
  benchmarkConfig
};
