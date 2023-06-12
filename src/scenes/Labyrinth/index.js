import {
  CoreSensors,
  ExtraSensors,
  CorePositionsGenerators
} from '@common';

import SceneRenderables from '@common/scene/renderables';
import PuckRenderables from '@common/puck/renderables';
import LocalRenderables from './robot/renderables';

import controller from './robot/controllers/controller';

import PuckFieldValueTracker from './benchmarking/puckFieldValueTracker';

import mapUrl from './labyrinth.png';

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
          type: 'Cartesian',
          name: 'left',
          coords: {
            x: 20,
            y: 6
          }
        },
        {
          type: 'Cartesian',
          name: 'centreLeft',
          coords: {
            x: 20,
            y: 2
          }
        },
        {
          type: 'Cartesian',
          name: 'centreRight',
          coords: {
            x: 20,
            y: -2
          }
        },
        {
          type: 'Cartesian',
          name: 'right',
          coords: {
            x: 20,
            y: -6
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
    width: 1024,
    height: 540,
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
    count: 1,
    radius: 18,
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
      tail: true
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
  objects: [
    {
      type: 'rectangle',
      center: { x: 512, y: 203 },
      width: 30,
      height: 405
    },
    {
      type: 'circle',
      center: { x: 512, y: 405 },
      radius: 15
    }
  ],
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

const description = {
  html: `<p>An implementation of the <b>Orbital Construction</b> algorithm which uses a scalar field to guide the construction of an enclosure.</p>

  <p>The scalar field is just a grayscale image.  A parameter <b>tau</b> defines a contour line of the scalar field.  In this case, the contour line is a circle and <b>tau = 0.6</b> defines that circle's radius.</p>

  <p>The <b style="color:cyan;">cyan robots</b> orbit the periphery, always trying to align themselves so that scalar field increases to their right.  They also try to reach the desired circle.  However, if they see a puck in their left sensor area, they will deviate to nudge it inwards.</p>

  <p>The <b style="color:yellow;">yellow robots</b> operate similarly, except they react to pucks in their right sensor area and deviate to nudge them outwards.</p>

  <p>
  <a href=https://ieeexplore.ieee.org/document/8599547 target=_blank>
  Vardy, Andrew. "Orbital construction: Swarms of simple robots building enclosures." 2018 IEEE 3rd International Workshops on Foundations and Applications of Self* Systems (FAS* W). IEEE, 2018.
  </a>
  </p>
  `
};

export default {
  title: 'Labyrinth',
  name: 'labyrinth',
  simConfig,
  benchmarkConfig,
  description
};