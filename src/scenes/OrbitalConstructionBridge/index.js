import {
  CoreSensors,
  ExtraSensors,
  CorePositionsGenerators
} from '@common';

import SceneRenderables from '@common/scene/renderables';
import PuckRenderables from '@common/puck/renderables';
import LocalRenderables from '../OrbitalConstruction/robot/renderables';

import { init, controller } from './robot/controllers/controller';

import PuckFieldValueTracker from '../OrbitalConstruction/benchmarking/puckFieldValueTracker';

import mapUrl from '../OrbitalConstruction/scalar_field.png';

import pythonBridger from './scene/pythonBridge';

// This constant defines the contour line of the scalar field around which the
// robots will build.
const tau = 0.6;

const renderables = [
  { module: 'Scene', elements: SceneRenderables },
  { module: 'Puck', elements: PuckRenderables },
  { module: 'Local', elements: [...LocalRenderables] }
];

const usedSensors = {
  ...CoreSensors,
  circles: {
    ...ExtraSensors.circles,
    params: {
      regions: [
        {
          name: 'leftObstacle',
          centre: { type: 'Polar', name: '0', coords: { distance: 6, angle: (-Math.PI / 4.0) } },
          radius: 2,
          sensedTypes: ['walls', 'robots']
        }
      ]
    }
  },
  fields: {
    ...ExtraSensors.fields,
    params: {
      // See the comments in FieldSensorExample for how to define points.
      points: [
        {
          type: 'Polar',
          name: 'leftField',
          coords: {
            distance: 6,
            angle: -Math.PI / 4
          }
        },
        {
          type: 'Polar',
          name: 'frontField',
          coords: {
            distance: 6,
            angle: 0
          }
        },
        {
          type: 'Polar',
          name: 'rightField',
          coords: {
            distance: 6,
            angle: Math.PI / 4
          }
        }
      ]
    }
  },
  polygons: {
    ...ExtraSensors.polygons,
    params: {
      // See the comments in FieldSensorExample for how to define points.
      regions:
            [
              {
                name: 'left',
                vertices: [
                  { type: 'Polar', name: '0', coords: { distance: 100, angle: (-1.0 * Math.PI) / 2 } },
                  { type: 'Polar', name: '1', coords: { distance: 100, angle: (-0.75 * Math.PI) / 2 } },
                  { type: 'Polar', name: '2', coords: { distance: 100, angle: (-0.5 * Math.PI) / 2 } },
                  { type: 'Polar', name: '3', coords: { distance: 100, angle: (-0.25 * Math.PI) / 2 } },
                  { type: 'Polar', name: '4', coords: { distance: 100, angle: (0.0 * Math.PI) / 2 } },
                  { type: 'Cartesian', name: 'bottomRight', coords: { x: 0, y: 5 } }
                ],
                sensedTypes: ['pucks']
              },
              {
                name: 'right',
                vertices: [
                  { type: 'Polar', name: '0', coords: { distance: 50, angle: (1.0 * Math.PI) / 2 } },
                  { type: 'Polar', name: '1', coords: { distance: 50, angle: (0.75 * Math.PI) / 2 } },
                  { type: 'Polar', name: '2', coords: { distance: 50, angle: (0.5 * Math.PI) / 2 } },
                  { type: 'Polar', name: '3', coords: { distance: 50, angle: (0.25 * Math.PI) / 2 } },
                  { type: 'Cartesian', name: 'bottomRight', coords: { x: 0, y: -5 } }
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
    renderSkip: 1,
    fields: {
      heatMap: {
        url: mapUrl,
        defaultBackground: true,
        title: 'Heat Map'
      }
    },
    effects: [
      {
        func: pythonBridger,
        framesBetweenRuns: 0
      }
    ]
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
        controller,
        params: { tau }
      },
      supportsUserDefinedControllers: false
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
  trackers: [new PuckFieldValueTracker(tau)],
  maxTimeStep: 20000,
  timeStep: 100
};

const description = {
  html: `
  <p>
    The task is planar construction, as in the
    <a href="./?scene=OrbitalConstruction">the Orbital Construction scene</a>,
    but using an externally defined controller that is connected via a Websocket bridge.
    The python code controlling this scene is in
    <code>./robot/controllers/orbital_construction.py</code>
    and the backend server that handles websocket connection with swarmJS is
    <code>./externalControllerServer.py</code>.
  </p>

  <h2>How to Run</h2>
  <p>
    Install dependencies for Python:
    <br>
    <code>
      pip install Flask Flask-SocketIO
      <br>
      pip install simple-websocket
    </code>
  </p>

  <p>
    Run Flask by executing the following command:
    <br>
    <code>
      flask --app src/scenes/OrbitalConstructionBridge/externalControllerServer.py run
    </code>
  </p>
`
};

export default {
  title: 'Orbital Construction via Websocket Bridge',
  name: 'orbitalConstructionBridge',
  simConfig,
  benchmarkConfig,
  description
};
