import {
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

// import RobotRenderables from './robot/renderables';

import { controller, init } from './robot/controllers/controller';

// All renderables should be registered in this list and assigned a module property
// This is necessary to avoid imposing a unique restriction on renderable type in different modules
// So if both robots and pucks have 'body' type renderables, they can still be treated as separate
// types and be disabled/enabled independently from the UI while also having a readable name
// There could be a cleaner way to do this, but it works for now
// Ordering is also important, as it determines which elements are shown on top
// Elements defined last are shown on top
const renderables = [
  { module: 'Scene', elements: SceneRenderables },
  { module: 'Robot', elements: RobotRenderables }
];

const simConfig = {
  env: {
    width: 600,
    height: 400,
    renderSkip: 1,
    externalEngine: {
      url: 'ws://localhost:5000',
      updateInterval: 100
    }
  },
  robots: {
    count: 2,
    radius: 5,
    params: {
      velocityScale: 15
    },
    controllers: {
      waypoint: CoreControllers.waypoint.bvcWaypointController,
      velocity: {
        init,
        controller,
        params: { angularVelocityScale: 0.01 }
      }
    },
    sensors: [...Object.values(CoreSensors), ...Object.values(ExtraSensors)],
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
  renderables,
  dynamicPropertyDefinitions: Object.values(defaultDynamicPropertyDefinitions)
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
    CorePerformanceTrackers.RobotToGoalDistanceTracker,
    CorePerformanceTrackers.MinRobotRobotDistanceTracker
  ],
  maxTimeStep: 20000,
  timeStep: 1000
};

const description = {
  html: `<p>The 'External Engine' scene demonstrates connecting SwarmJS with an external server for simulation.</p>

  <p>To use it:</p>
  
  <p>- Start SwarmJS and select the 'External Engine' scene.</p>
  <p>- Launch 'src/scenes/ExternalEngine/will-o-wisp server/server.js' using the command: > python server.js.</p>
  <p>The server is an example implementation of a Python script (tested with Python 3.10.6). It creates a web server
  and accepts WebSocket connections from SwarmJS. It receives robot goals from SwarmJS, simulates robot movement,
  and sends updated positions back to SwarmJS. The Python server also logs all received and sent messages to the 
  console.</p>`
};

export default {
  title: 'External Engine',
  name: 'ExternalEngine',
  simConfig,
  benchmarkConfig,
  description
};
