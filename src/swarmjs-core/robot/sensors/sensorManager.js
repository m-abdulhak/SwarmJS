/*  This module is responsible for managing the sensors,
    sensors are imported and stored in this module,
    all sampling is done through this module.
*/

import PositionSensor from './positionSensor';
import PrevPositionSensor from './prevPositionSensor';
import OrientationSensor from './orientationSensor';
import HeadingSensor from './headingSensor';
import NearbyPucksSensor from './nearbyPucksSensor';
import NeighborsSensor from './neighborsSensor';
import VoronoiCellSensor from './voronoiCellSensor';

const toposort = require('toposort');

export const sensorSamplingTypes = {
  onStart: 'start',
  onUpdate: 'update',
  onRequest: 'none'
};

const availableSensorDefitions = [
  PositionSensor,
  PrevPositionSensor,
  OrientationSensor,
  HeadingSensor,
  NearbyPucksSensor,
  NeighborsSensor,
  VoronoiCellSensor
];

// Sensors are stored in this object allowing other modules to easily reference them
// e.g. in config when defining the enabled sensors, or in other sensors to define a dependency
export const availableSensors = availableSensorDefitions.reduce((acc, sensorDef) => {
  acc[sensorDef.name] = sensorDef;
  return acc;
}, {});

const orderSensors = (sensorList) => {
  const edges = [];
  sensorList.forEach((sensor) => {
    if (sensor.dependencies && sensor.dependencies.length > 0) {
      sensor.dependencies.forEach((dependency) => {
        edges.push([dependency.name, sensor.name]);
      });
    }
  });
  const sorted = toposort(edges);
  const unsorted = sensorList
    .filter((sensor) => !sorted.includes(sensor.name))
    .map((sensor) => sensor.name);

  return [...unsorted, ...sorted].map((name) => sensorList.find((s) => s.name === name));
};

const sampleSensors = (sensorsList) => {
  sensorsList.forEach((sensor) => {
    sensor.sample();
  });
};

export default class SensorManager {
  constructor(scene, robot, enabledSensors) {
    this.scene = scene;
    this.robot = robot;

    this.activeSensors = orderSensors(
      enabledSensors.map(({ Sensor }) => new Sensor(robot, scene))
    );
    this.sensorsOnStart = this.activeSensors
      .filter((s) => s.type === sensorSamplingTypes.onStart);
    this.sensorsOnUpdate = this.activeSensors
      .filter((s) => s.type === sensorSamplingTypes.onUpdate);
  }

  readAll() {
    return this.activeSensors.reduce((acc, sensor) => {
      acc[sensor.name] = sensor.read();
      return acc;
    }, {});
  }

  read(name) {
    const sensor = this.activeSensors.find((s) => s.name === name);
    return sensor.read();
  }

  sense(name) {
    const sensor = this.activeSensors.find((s) => s.name === name);
    if (sensor.type === sensorSamplingTypes.onRequest) {
      sensor.sample();
    }
    return sensor.read();
  }

  sample(name) {
    const sensor = this.activeSensors.find((s) => s.name === name);
    if (sensor) {
      sensor.sample();
    }
  }

  update() {
    sampleSensors(this.sensorsOnUpdate);
  }

  start() {
    sampleSensors(this.sensorsOnStart);
  }
}
