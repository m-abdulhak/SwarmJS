import './stylesheets/styles.css';

import React from 'react';
import ReactDOM from 'react-dom';

import { availableSensors } from './swarmjs-core/robot/sensors/sensorManager';
import { availableActuators } from './swarmjs-core/robot/actuators/actuatorsManager';
import getRandCollFreePosGenerator from './swarmjs-core/utils/randomPositionsGenerator';
import App from './components/App';
import { PerformanceTrakers, Controllers } from './swarmjs-core/main';

const config = {
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
      // velocity: Controllers.velocity.omniDirVelocityController
      velocity: Controllers.velocity.diffVelocityController
    },
    sensors: Object.values(availableSensors),
    actuators: Object.values(availableActuators)
  },
  pucks: {
    groups: [
      {
        id: 0,
        count: 20,
        radius: 10,
        goal: { x: 150, y: 250 },
        color: 'red'
      },
      {
        id: 1,
        count: 20,
        radius: 10,
        goal: { x: 650, y: 375 },
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
  positionsGenerator: getRandCollFreePosGenerator
};

// // Configs for compound body example
// const compoundBodyRobotSim = config;
// compoundBodyRobotSim.robots.radius = 10;
// compoundBodyRobotSim.pucks.groups[0].radius = 7;
// compoundBodyRobotSim.pucks.groups[1].radius = 7;

const benchmarkSettings = {
  configs: [
    {
      name: '5 Robots',
      simConfig: {
        ...config,
        env: {
          ...config.env,
          speed: 50
        },
        robots: {
          ...config.robots,
          count: 5
        }
      }
    },
    {
      name: '20 Robots',
      simConfig: {
        ...config,
        env: {
          ...config.env,
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
