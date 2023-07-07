import {
  CoreSensors,
  ExtraSensors,
  CorePositionsGenerators,
  CorePerformanceTrakers
} from '@common';

import SceneRenderables from '@common/scene/renderables';

import RobotRenderables from './robot/renderables';

import { init, controller } from './robot/controllers/controller';

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
            x: 0,
            y: 30
          }
        },
        {
          type: 'Polar',
          name: 'right45',
          coords: {
            distance: 30,
            angle: Math.PI / 4.0
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
        url: mapUrl,
        defaultBackground: true,
        title: 'Heat Map'
      }
    }
  },
  robots: {
    count: 3,
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
  html: `<p>A demo scene.  The index.js file that underlies this scene has more comments than other scenes.  So this scene serves the purpose of demonstration but also as a template for your own scene.</p>
  `
};


export default {
  title: 'Demo (General)',
  name: 'demo',
  simConfig,
  benchmarkConfig,
  description
};
