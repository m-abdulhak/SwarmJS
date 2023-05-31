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

import controller from './robot/controllers/controller';
import actuatorController from './robot/controllers/actuatorController';

import pucksNearGrabberSensor from './robot/sensors/pucksNearGrabberSensor';
import closestPuckToGrabberSensor from './robot/sensors/closestPuckToGrabberSensor';

const renderables = [
  { module: 'Scene', elements: SceneRenderables },
  { module: 'Puck', elements: PuckRenderables },
  { module: 'Robot', elements: [...RobotRenderables] }
];

const usedSensors = {
  ...CoreSensors,
  pucksNearGrabberSensor, closestPuckToGrabberSensor,
  circles: {
    ...ExtraSensors.circles,
    params: {
      areas: [
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
  }
};

const simConfig = {
  env: {
    width: 600,
    height: 400,
    speed: 15
  },
  robots: {
    count: 1,
    radius: 10,
    controllers: {
      actuators: actuatorController,
      velocity: {
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
          speed: 50
        },
        robots: {
          count: 5
        }
      }
    },
    {
      name: '20 Robots',
      simConfig: {
        env: {
          speed: 50
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

export default {
  title: 'Object Clustering',
  name: 'cluster',
  simConfig,
  benchmarkConfig
};
