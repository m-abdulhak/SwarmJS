import {
  CoreActuators,
  CoreSensors,
  ExtraSensors,
  CorePositionsGenerators,
  CorePerformanceTrakers
} from '@common';

import SceneRenderables from '@common/scene/renderables';
import PuckRenderables from '@common/puck/renderables';
import RobotRenderables from './robot/renderables';

import { init, controller } from './robot/controllers/controller';

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
          centre: { type: 'Polar', name: '0', coords: { distance: 15, angle: (- Math.PI / 4.0) } },
          radius: 5,
          sensedTypes: ['walls', 'robots']
        },
        {
          name: 'right',
          centre: { type: 'Polar', name: '0', coords: { distance: 15, angle: (Math.PI / 4.0) } },
          radius: 5,
          sensedTypes: ['walls', 'robots']
        },
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
                  { type: 'Cartesian', name: '2', coords: { y:  10, x: 25 } },
                  { type: 'Cartesian', name: '3', coords: { y:  10, x: 15 } }
                ],
                sensedTypes: ['pucks']
              },
              {
                name: 'outer',
                vertices: [
                  { type: 'Cartesian', name: '0', coords: { y: -20, x: 30 } },
                  { type: 'Cartesian', name: '1', coords: { y: -20, x: 40 } },
                  { type: 'Cartesian', name: '2', coords: { y:  20, x: 40 } },
                  { type: 'Cartesian', name: '3', coords: { y:  20, x: 30 } }
                ],
                sensedTypes: ['pucks']
              }
            ]
    }
  }
};

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
    // The neighbors sensor doesn't work unless the Voronoi diagram is used.
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
  renderables
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
    CorePerformanceTrakers.RobotToGoalDistanceTracker,
    CorePerformanceTrakers.MinRobotRobotDistanceTracker
  ],
  maxTimeStep: 20000,
  timeStep: 1000
};

const description = {
  html: `<p>An example of self-organized clustering.  Each robot can sense pucks in two sensor regions (inner and outer) and choose to pick-up or deposit pucks depending on whether they are in a low-density or high-density region (i.e. there are few pucks, or many pucks).</p>
  </p>
  `
};

export default {
  title: 'Object Clustering',
  name: 'cluster',
  simConfig,
  benchmarkConfig,
  description
};
