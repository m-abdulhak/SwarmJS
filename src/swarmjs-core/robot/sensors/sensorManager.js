/*  This module is responsible for managing the sensors,
    sensors are imported and stored in this module,
    all sampling is done through this module.
*/

import PositionSensor from './positionSensor';
import PrevPositionSensor from './prevPositionSensor';

const toposort = require('toposort');

export const sensorSamplingTypes = {
  onStart: 'start',
  onUpdate: 'update',
  onRequest: 'none'
};

// sensors are stored in this object
// key: used to refer to the sensor from other modules,
//      e.g. in config when defining the enabled sensors, or in other sensors to define a dependency
// name: used to access (sample and read) the sensor during runtime through the sensor manager
// Sensor: the actual sensor object (class or function)
// TODO:  is there a  better way to define the sensors without having both a key and a name, while
//        keeping the dependency definitions and enebled sensors definitions as clean as possible?
export const availableSensors = {
  position: {
    name: 'position',
    Sensor: PositionSensor
  },
  prevPosition: {
    name: 'prevPosition',
    Sensor: PrevPositionSensor
  }
};

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
  return sorted.map((name) => sensorList.find((s) => s.name === name));
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
      enabledSensors.map(({ name, Sensor }) => new Sensor(name, robot, scene))
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
