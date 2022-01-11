import './stylesheets/styles.css';

import React from 'react';
import ReactDOM from 'react-dom';

import { availableSensors } from './swarmjs-core/robot/sensors/sensorManager';
import { availableActuators } from './swarmjs-core/robot/actuators/actuatorsManager';
import getRandCollFreePosGenerator from './swarmjs-core/utils/randomPositionsGenerator';
import App from './components/App';

const config = {
  env: {
    width: 800,
    height: 500,
    speed: 15
  },
  robots: {
    count: 20,
    radius: 7,
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

const benchGraphSettings = {
  width: 1400,
  height: 600,
  margin: {
    top: 30,
    right: 60,
    bottom: 80,
    left: 60
  },
  actualWidth: 1400 - 60 - 60,
  actualHeight: 600 - 30 - 80
};

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
    {
      name: 'Distance',
      title: 'Total Pucks To Goal Distance',
      getValue: (scene) => scene.distance,
      // How to reduce values measured within a single time instance to a single value:
      // 'first', 'last', 'average', 'sum', 'min', 'max', ...
      reduce: (values) => values.reduce((acc, val) => acc + val, 0) / values.length,
      // How to aggregate values corresponding to the same time instance across multiple runs,
      // Used to generate a 'highlight' plot to show the trend across multiple runs:
      // 'min', 'max', 'average', ...
      aggregate: (values) => values.reduce((acc, val) => acc + val, 0) / values.length,
      aggregationType: 'Average',
      graphSettings: { ...benchGraphSettings, xTitle: 'Time (ms)', yTitle: 'Distance (cm)' }
    },
    {
      name: 'Pucks',
      title: 'Number of Pucks Outside of Goal Area',
      getValue: (scene) => scene.pucksOutsideGoalCount,
      reduce: (values) => values.reduce((acc, val) => acc + val, 0) / values.length,
      aggregate: (values) => values.reduce((acc, val) => acc + val, 0) / values.length,
      aggregationType: 'Average',
      graphSettings: { ...benchGraphSettings, xTitle: 'Time (ms)', yTitle: 'Pucks' }
    }
  ],
  maxTimeStep: 25000,
  timeStep: 100
};

ReactDOM.render(
  <App config={config} benchSettings={benchmarkSettings}/>,
  document.getElementById('root')
);
