import {
  AvailableActuators,
  AvailableSensors,
  PositionsGenerators,
  PerformanceTrakers,
  Controllers
} from '..';

const simConfig = {
  env: {
    width: 800,
    height: 500,
    speed: 15
  },
  robots: {
    count: 10,
    radius: 10,
    controllers: {
      actuators: Controllers.actuators.simpleSortingActuatorController,
      goal: Controllers.goal.simpleSortingGoalController,
      waypoint: Controllers.waypoint.dummyWaypointController,
      // velocity: Controllers.velocity.omniDirVelocityController
      velocity: {
        controller: Controllers.velocity.diffVelocityController,
        params: { angularVelocityScale: 0.001 }
      }
    },
    sensors: Object.values(AvailableSensors),
    actuators: Object.values(AvailableActuators),
    useVoronoiDiagram: false
  },
  pucks: {
    groups: [
      {
        id: 0,
        count: 20,
        radius: 7,
        goal: { x: 150, y: 250 },
        goalRadius: 7 * 12,
        color: 'red'
      },
      {
        id: 1,
        count: 20,
        radius: 7,
        goal: { x: 650, y: 375 },
        goalRadius: 7 * 12,
        color: 'blue'
      }
    ],
    useGlobalPuckMaps: false
  },
  objects: [],
  positionsGenerator: PositionsGenerators.randomCollisionFree
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
    PerformanceTrakers.RobotToGoalDistanceTracker,
    PerformanceTrakers.PucksOutsideGoalTracker,
    PerformanceTrakers.MinRobotRobotDistanceTracker
  ],
  maxTimeStep: 20000,
  timeStep: 1000
};

export default {
  title: 'Simple Sorting',
  name: 'simpleSorting',
  simConfig,
  benchmarkConfig
};
