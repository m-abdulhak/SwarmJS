import {
  CoreSensors,
  ExtraSensors,
  CorePositionsGenerators,
  defaultDynamicPropertyDefinitions,
  defaultStaticPropertyDefinitions
} from '@common';

import SceneRenderables from '@common/scene/renderables';

import RobotRenderables from './robot/renderables';

import { init, controller } from './robot/controllers/controller';

import DistanceToGoalTracker from './benchmarking/distanceToGoalTracker';

import mapUrl from './map.png';

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
          centre: { type: 'Polar', name: '0', coords: { distance: 8, angle: (-Math.PI / 4.0) } },
          radius: 3,
          sensedTypes: ['walls']
        },
        {
          name: 'right',
          centre: { type: 'Polar', name: '0', coords: { distance: 8, angle: (Math.PI / 4.0) } },
          radius: 3,
          sensedTypes: ['walls']
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

const supportedDynamicProps = [
  defaultDynamicPropertyDefinitions.robotCount
];

const supportedStaticProps = [
  defaultStaticPropertyDefinitions.robotCount,
  {
    ...defaultStaticPropertyDefinitions.robotRadius,
    max: 8
  }
];

const simConfig = {
  env: {
    width: 600,
    height: 400,
    renderSkip: 1,
    background: mapUrl,
    fields: {
      temperature: {
        url: mapUrl,
        title: 'Temperature'
      }
    }
  },
  robots: {
    count: 50,
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
    actuators: [],
    useVoronoiDiagram: false,
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
  dynamicPropertyDefinitions: supportedDynamicProps,
  staticPropertyDefinitions: supportedStaticProps
};

const benchmarkConfig = {
  simConfigs: [
    {
      name: 'theta = 0.001',
      simConfig: {
        env: {
          renderSkip: 50
        },
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
        env: {
          renderSkip: 50
        },
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
  trackers: [DistanceToGoalTracker],
  maxTimeStep: 20000,
  timeStep: 100
};

const description = {
  html: `
  <p>
    An implementation of the BEECLUST algorithm which was originally proposed to model the ability of young bees to
    congregate at the warmest point in a temperature field.
  </p>
  
  <p>
    The number printed above each robot is the potential waiting time.
    This is computed from the scalar field at the robot's current position.
    We can think of this as temperature.
    When another robot is sensed, the robot will enter a waiting state.
    Since the waiting time is higher in high temperature areas, that is where the robots tend to cluster.
    As a whole, the swarm <em>finds</em> the warmest spot without ever doing any direct temperature comparisons.
  </p>

  <p>
    <a href=https://www.thomasschmickl.eu/complexity/beeclust target=_blank>
      A nice informal description of the BEECLUST algorithm
    </a>
  </p>

  <a href=https://link.springer.com/article/10.1007/s10458-008-9058-5 target=_blank>
    Schmickl, Thomas, et al.
    "Get in touch: cooperative decision making based on robot-to-robot collisions."
    Autonomous Agents and Multi-Agent Systems 18 (2009): 133-155.
  </a>
  `
};

export default {
  title: 'BEEClust',
  name: 'beeClust',
  simConfig,
  benchmarkConfig,
  description
};
