import {
  CoreSensors,
  ExtraSensors,
  CorePositionsGenerators
} from '@common';

import SceneRenderables from '@common/scene/renderables';
import PuckRenderables from '@common/puck/renderables';
import RobotRenderables from './robot/renderables';

import controller from './robot/controllers/controller';

// import PuckFieldValueTracker from './benchmarking/puckFieldValueTracker';
import PuckFieldValueTracker from './benchmarking/puckFieldValueTracker';

import mapUrl from '../../../python_scripts/scalar_field.png';

// This constant defines the contour line of the scalar field around which the
// robots will build.
const tau = 0.6;

const renderables = [
  { module: 'Scene', elements: SceneRenderables },
  { module: 'Puck', elements: PuckRenderables },
  { module: 'Robot', elements: [...RobotRenderables] }
];

const usedSensors = {
  ...CoreSensors,
  circles: {
    ...ExtraSensors.circles,
    params: {
      regions: [
        {
          name: 'leftObstacle',
          centre: { type: 'Polar', name: '0', coords: { distance: 6, angle: (- Math.PI / 4.0) } },
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
    speed: 15,
    renderSkip: 1,
    fields: {
      heatMap: {
        url: mapUrl,
        defaultBackground: true
      }
    }
  },
  robots: {
    count: 10,
    radius: 4,
    controllers: {
      velocity: {
        controller
        /*,
        
        WOULD LIKE TO PASS ALONG TAU AS A PARAMETER HERE BUT PASSING PARAMETERS
        TO A VELOCITY CONTROLLER SEEMS TO HAVE BROKEN.

        params: { tau: tau }
        */
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
  renderables
};

const benchmarkConfig = {
  simConfigs: [
    {
      name: '5 Robots',
      simConfig: {
        robots: {
          count: 5
        }
      }
    },
    {
      name: '30 Robots',
      simConfig: {
        robots: {
          count: 30
        }
      }
    }
  ],
  trackers: [ new PuckFieldValueTracker(tau) ],
  maxTimeStep: 20000,
  timeStep: 100
};

export default {
  title: 'Orbital Construction',
  name: 'orbitalConstruction',
  simConfig,
  benchmarkConfig
};
