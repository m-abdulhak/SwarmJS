import './stylesheets/styles.css';

import React from 'react';
import ReactDOM from 'react-dom';

import {
  AvailableActuators,
  AvailableSensors,
  PositionsGenerator,
  PerformanceTrakers,
  Controllers
} from './swarmjs-core/main';

import App from './components/App';

const exampleSortingConfig = {
  env: {
    width: 800,
    height: 500,
    speed: 15
  },
  robots: {
    count: 10,
    radius: 10,
    controllers: {
      actuators: Controllers.actuators.exampleSortingActuatorController,
      goal: Controllers.goal.exampleSortingGoalController,
      waypoint: Controllers.waypoint.dummyWaypointController,
      // velocity: Controllers.velocity.omniDirVelocityController
      velocity: {
        controller: Controllers.velocity.diffVelocityController,
        params: { angularVelocityScale: 0.001 }
      }
    },
    sensors: Object.values(AvailableSensors),
    actuators: Object.values(AvailableActuators)
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
    ]
  },
  objects: [],
  positionsGenerator: PositionsGenerator.randomCollisionFree
};

const mainConfig = {
  env: {
    width: 800,
    height: 500,
    speed: 15
  },
  robots: {
    count: 20,
    radius: 7,
    controllers: {
      goal: {
        controller: Controllers.goal.sortingGoalController,
        params: {
          limitPuckSelectionToBVC: true,
          environmentOrbit: true
        }
      },
      waypoint: Controllers.waypoint.bvcWaypointController,
      // velocity: Controllers.velocity.omniDirVelocityController
      velocity: {
        controller: Controllers.velocity.diffVelocityController,
        params: { angularVelocityScale: 0.01 }
      }
    },
    sensors: Object.values(AvailableSensors),
    actuators: Object.values(AvailableActuators)
  },
  pucks: {
    groups: [
      {
        id: 0,
        count: 20,
        radius: 10,
        goal: { x: 150, y: 250 },
        goalRadius: 7 * 12,
        color: 'red'
      },
      {
        id: 1,
        count: 20,
        radius: 10,
        goal: { x: 650, y: 375 },
        goalRadius: 7 * 12,
        color: 'blue'
      }
    ]
  },
  objects: [
    {
      type: 'rectangle',
      center: { x: 400, y: 100 },
      width: 50,
      height: 225
    },
    {
      type: 'rectangle',
      center: { x: 550, y: 225 },
      width: 350,
      height: 50
    },
    {
      type: 'rectangle',
      center: { x: 750, y: 100 },
      width: 350,
      height: 50
    },
    {
      type: 'circle',
      center: { x: 100, y: 150 },
      radius: 50,
      skipOrbit: true
    },
    {
      type: 'rectangle',
      center: { x: 350, y: 425 },
      width: 50,
      height: 150
    },
    {
      type: 'rectangle',
      center: { x: 250, y: 375 },
      width: 250,
      height: 50
    }
  ],
  positionsGenerator: PositionsGenerator.randomCollisionFree
};

const config = exampleSortingConfig;

// // Configs for compound body example
// const compoundBodyRobotSim = config;
// compoundBodyRobotSim.robots.radius = 10;
// compoundBodyRobotSim.pucks.groups[0].radius = 7;
// compoundBodyRobotSim.pucks.groups[1].radius = 7;

// Define benchmark configurations:
// - timeStep: minimum reported time step, will be used as the time unit in the graphs
// - maxTimeStep: length of each simulation run
// - trackers: list of objects that provide a function to calculate a performance metric at
//        each simulation update along with functions for readucing and aggregating values.
//        Tracker (@swarmjs-core/benchmarking) can be used as a reference and extended as
//        it provides most of the needed functionalities.
//        Each tracker will result in a graph in the performance graphs tab
// - simConfigs: list of simulation configurations that will be compared against each others
//        across multiple runs using the performance metrics provided by the trackers.
//        - name: a unique name that will be used to reference this config in the graphs legends
//        - simConfig: all the changes from main config that will be applied to this simulation
const benchmarkSettings = {
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
    PerformanceTrakers.PucksOutsideGoalTracker
  ],
  maxTimeStep: 2000,
  timeStep: 100
};

ReactDOM.render(
  <App config={config} benchSettings={benchmarkSettings}/>,
  document.getElementById('root')
);
