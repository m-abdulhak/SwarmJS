import {
  CoreSensors,
  ExtraSensors,
  CorePositionsGenerators,
  CorePerformanceTrackers,
  defaultDynamicPropertyDefinitions
} from '@common';

import SceneRenderables from '@common/scene/renderables';
import PuckRenderables from '@common/puck/renderables';

const MyRobotRenderables = [
  {
    type: 'Body',
    svgClass: 'robot-body',
    dataPoints: { sceneProp: 'robots' },
    shape: 'circle',
    staticAttrs: {
      r: { prop: 'radius' },
      id: { prop: 'id' }
    },
    dynamicAttrs: {
      cx: { prop: 'sensors.position.x' },
      cy: { prop: 'sensors.position.y' }
    },
    styles: {
      fill: { prop: 'color' },
      stroke: 'black',
      'stroke-width': 1,
      'stroke-opacity': 1,
      'fill-opacity': 1
    },
    drag: {
      prop: 'position',
      pause: true,
      onStart: {
        styles: {
          stroke: 'green'
        },
        log: [
          { prop: 'sensors' }
        ]
      },
      onEnd: {
        styles: {
          stroke: 'black'
        }
      }
    }
  },
  {
    type: 'Body',
    svgClass: 'robot-orientation',
    desc: 'Line segments between robots and headings',
    dataPoints: { sceneProp: 'robots' },
    shape: 'path',
    staticAttrs: {
      id: { prop: 'id' }
    },
    dynamicAttrs: {
      points: [
        { prop: 'sensors.position' },
        { prop: 'sensors.heading' }
      ]
    },
    styles: {
      fill: 'none',
      stroke: 'black',
      'stroke-width': 2,
      'stroke-opacity': 1,
      'fill-opacity': 1
    }
  },
  {
    type: 'Sensor',
    svgClass: '',
    desc: 'Left Polygon Puck Sensor',
    shape: 'polygon',
    dataPoints: { sceneProp: 'robots' },
    staticAttrs: {
      stroke: 'none'
    },
    dynamicAttrs: {
      fill: 'rgb(0, 0, 255, 0.15)',
      points: { prop: 'sensors.polygons.left.vertices' }
    },
    styles: {
      fill: 'none',
      stroke: 'black',
      'fill-opacity': 0,
      'stroke-width': 1,
      'stroke-opacity': 1
    }
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
    controllers: {
      velocity: {
        controller: (robot) => {
          const maxAngularSpeed = 0.015;
          const maxForwardSpeed = 0.2;

          return (sensors) => {
            const leftPucks = sensors.polygons.left.reading.pucks;
            const angularSpeed = leftPucks > 0 ? -maxAngularSpeed : maxAngularSpeed;

            return {
              linearVel: maxForwardSpeed * robot.velocityScale,
              angularVel: angularSpeed * robot.velocityScale,
              type: robot.SPEED_TYPES.RELATIVE
            };
          };
        }
      },
      supportsUserDefinedControllers: false
    },
    sensors: [
      ...Object.values(CoreSensors),
      {
        ...ExtraSensors.polygons,
        params: {
          regions:
              [
                {
                  name: 'left',
                  vertices: [
                    { type: 'Polar', name: '0', coords: { distance: 100, angle: (-0.25 * Math.PI) / 2 } },
                    { type: 'Polar', name: '1', coords: { distance: 100, angle: (0.0 * Math.PI) / 2 } },
                    { type: 'Cartesian', name: 'bottomRight', coords: { x: 0, y: 5 } }
                  ],
                  sensedTypes: ['pucks']
                }
              ]
        }
      }
    ],
    actuators: [],
    useVoronoiDiagram: false
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
  renderables: [
    { module: 'Scene', elements: SceneRenderables },
    { module: 'Puck', elements: PuckRenderables },
    { module: 'Robot', elements: MyRobotRenderables }
  ],
  dynamicPropertyDefinitions: [
    defaultDynamicPropertyDefinitions.velocityScale
  ]
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
    CorePerformanceTrackers.MinRobotRobotDistanceTracker
  ],
  maxTimeStep: 20000,
  timeStep: 100
};

export default {
  title: 'Advanced Tutorial Example',
  name: 'advancedTutorialScene',
  simConfig,
  benchmarkConfig,
  description: {
    html: '<p>Advanced Tutorial Example</p>'
  }
};
