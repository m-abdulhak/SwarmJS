import {
  CoreActuators,
  CoreSensors,
  ExtraSensors,
  CorePositionsGenerators,
  CorePerformanceTrakers,
  CoreControllers
} from '@common';

import SceneRenderables from '@common/scene/renderables';
import RobotRenderables from '@common/robot/renderables';
import PuckRenderables from '@common/puck/renderables';

const renderables = [
  { module: 'Scene', elements: SceneRenderables },
  { module: 'Puck', elements: PuckRenderables },
  { module: 'Robot', elements: RobotRenderables }
];

const simConfig = {
  env: {
    width: 800,
    height: 500,
    renderSkip: 1
  },
  robots: {
    count: 20,
    radius: 10,
    params: {
      velocityScale: 10
    },
    controllers: {
      waypoint: CoreControllers.waypoint.bvcWaypointController,
      // velocity: CoreControllers.velocity.omniDirVelocityController
      velocity: {
        controller: CoreControllers.velocity.diffVelocityController,
        params: { angularVelocityScale: 0.01 }
      },
      supportsUserDefinedControllers: false
    },
    sensors: [...Object.values(CoreSensors), ...Object.values(ExtraSensors)],
    actuators: Object.values(CoreActuators),
    useVoronoiDiagram: true
  },
  pucks: {
    groups: [],
    useGlobalPuckMaps: false
  },
  objects: [],
  positionsGenerator: CorePositionsGenerators.circularPositionsGenerator,
  renderables
};

// TODO: add other waypoint controller to benchmark
const benchmarkConfig = {
  simConfigs: [
    {
      name: '10 Robots',
      simConfig: {
        env: {
          renderSkip: 50
        },
        robots: {
          count: 10,
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
    CorePerformanceTrakers.PucksOutsideGoalTracker,
    CorePerformanceTrakers.MinRobotRobotDistanceTracker
  ],
  maxTimeStep: 50000,
  timeStep: 1000
};

const description = {
  html: `<p>Object sorting using Buffered Voronoi Cells (BVC).  Each robot chooses an intermediate goal location within its BVC.  This avoids the possibility of collision or conflict with other robots.  Their goal is to incremental shift the pucks towards their respective goal locations.</p>

  <p>Rather than pushing pucks directly towards their goals, the robots make use of a goal map for each type of pucks.  A goal map specifies the direction a puck should be pushed in order to reach the goal, accounting for obstacles that might be in the way.</p>

  <p>
  <a href=https://link.springer.com/chapter/10.1007/978-3-031-20176-9_27 target=_blank>
  Abdullhak, Mohammed, and Andrew Vardy. "Distributed Sorting in Complex Environments." Swarm Intelligence: 13th International Conference, ANTS 2022, Málaga, Spain, November 2–4, 2022, Proceedings. Cham: Springer International Publishing, 2022.
  </a>
  </p>
  `
};

export default {
  title: 'Collision Avoidance',
  name: 'collisionAvoidance',
  simConfig,
  benchmarkConfig,
  description
};
