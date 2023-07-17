import {
  CoreSensors,
  ExtraSensors,
  CorePositionsGenerators,
  defaultDynamicPropertyDefinitions,
  defaultStaticPropertyDefinitions
} from '@common';

import SceneRenderables from '@common/scene/renderables';
import PuckRenderables from '@common/puck/renderables';
import LocalRenderables from './robot/renderables';

import { init, controller } from './robot/controllers/controller';

import PuckFieldValueTracker from './benchmarking/puckFieldValueTracker';

import labyrinthUrl from './labyrinth.png';
import travelTimeUrl from './travel_time_0.png';
// import mapUrl from './black.png';

const nSensorRegions = 8;

const renderables = [
  { module: 'Scene', elements: SceneRenderables },
  { module: 'Puck', elements: PuckRenderables },
  { module: 'Robot', elements: [...LocalRenderables] }
];

const circleSensorRegions = [];
const deltaAngle = (2 * Math.PI) / nSensorRegions;

// eslint-disable-next-line no-plusplus
for (let i = 0; i < nSensorRegions; ++i) {
  const angle = i * deltaAngle;
  circleSensorRegions.push({
    name: `index${i}`,
    centre: { type: 'Polar', name: '0', coords: { distance: 20, angle } },
    radius: 4,
    sensedTypes: ['pucks']
  });
}

const usedSensors = {
  ...CoreSensors,
  fields: {
    ...ExtraSensors.fields,
    params: {
      // See the comments in FieldSensorExample for how to define points.
      points: [
        {
          type: 'Cartesian',
          name: 'left',
          coords: {
            x: 5,
            y: 4
          }
        },
        {
          type: 'Cartesian',
          name: 'centre',
          coords: {
            x: 5,
            y: 0
          }
        },
        {
          type: 'Cartesian',
          name: 'right',
          coords: {
            x: 5,
            y: -4
          }
        },
        {
          type: 'Cartesian',
          name: 'edge',
          coords: {
            x: 0,
            y: -14
          }
        }
      ]
    }
  },
  polygons: {
    ...ExtraSensors.polygons,
    params: {
      regions:
            [
              {
                name: 'ahead',
                vertices: [
                  { type: 'Cartesian', name: '0', coords: { y: -10, x: 20 } },
                  { type: 'Cartesian', name: '1', coords: { y: -10, x: 30 } },
                  { type: 'Cartesian', name: '2', coords: { y: 10, x: 30 } },
                  { type: 'Cartesian', name: '3', coords: { y: 10, x: 20 } }
                ],
                sensedTypes: ['robots']
              }
            ]
    }
  },
  circles: {
    ...ExtraSensors.circles,
    params: {
      regions: circleSensorRegions
    }
  }
};

const supportedDynamicProps = [
  defaultDynamicPropertyDefinitions.robotCount,
  defaultDynamicPropertyDefinitions.velocityScale,
  defaultDynamicPropertyDefinitions.pucksCountG1
];

const supportedStaticProps = [
  defaultStaticPropertyDefinitions.robotCount,
  defaultStaticPropertyDefinitions.velocityScale,
  {
    ...defaultStaticPropertyDefinitions.robotRadius,
    min: 8
  },
  defaultStaticPropertyDefinitions.pucksCountG1,
  {
    ...defaultStaticPropertyDefinitions.pucksRadiusG1,
    max: 8
  }
];

const simConfig = {
  env: {
    width: 1024,
    height: 540,
    renderSkip: 5,
    fields: {
      heatMap: {
        url: labyrinthUrl,
        defaultBackground: true,
        title: 'Heat Map'
      },
      travelTime: {
        url: travelTimeUrl,
        title: 'Travel Time'
      }
    }
  },
  robots: {
    count: 10,
    radius: 16,
    params: {
      velocityScale: 15
    },
    controllers: {
      velocity: {
        init,
        controller
      }
    },
    sensors: [...Object.values(usedSensors)],
    actuators: [],
    useVoronoiDiagram: false,
    misc: {
      tail: true,
      tailSlope: -1.5
    }
  },
  pucks: {
    groups: [
      {
        id: 0,
        count: 100,
        radius: 5,
        color: 'chartreuse'
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
  renderables,
  dynamicPropertyDefinitions: supportedDynamicProps,
  staticPropertyDefinitions: supportedStaticProps
};

const benchmarkConfig = {
  simConfigs: [
    {
      name: 'Tail Slope -1.5',
      simConfig: {
        env: {
          renderSkip: 50
        },
        robots: {
          misc: {
            tail: true,
            tailSlope: -1.5
          }
        }
      }
    },
    {
      name: 'Tail Slope 1.5',
      simConfig: {
        env: {
          renderSkip: 50
        },
        robots: {
          misc: {
            tail: true,
            tailSlope: 1.5
          }
        }
      }
    }
  ],
  trackers: [new PuckFieldValueTracker(0)],
  maxTimeStep: 50000,
  timeStep: 100
};

const description = {
  html: `
  <p>
    A planar construction algorithm where the robots are constrained to operate within a labyrinth. 
    The labyrinth encodes the direction in which objects should be pushed so that they are moved around the grey 
    obstacle and join in the formation of the L shape on the left.
  </p>

  <p>
    <a href=https://link.springer.com/article/10.1007/s10015-022-00849-5 target=_blank>
      Vardy, Andrew. "The swarm within the labyrinth: planar construction by a robot swarm." 
      Artificial Life and Robotics 28, (2023): 117-126.
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
