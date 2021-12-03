/*  This module is responsible for managing the sensors,
    sensors are imported and stored in this module,
    all sampling is done through this module.
*/

import PositionSensor from './positionSensor';

export const sensorSamplingTypes = {
  onStart: 'start',
  onUpdate: 'update',
  onRequest: 'none'
};

export const sensors = {
  position: PositionSensor
};

export default class SensorManager {
  constructor(scene, robot, enabledSensors) {
    this.scene = scene;
    this.robot = robot;
    this.activeSensors = enabledSensors.map((Sensor) => new Sensor(scene, robot));
  }

  sampleAll() {
    this.activeSensors.forEach((sensor) => {
      sensor.sample();
    });
  }

  readAll() {
    return this.activeSensors.reduce((acc, sensor) => {
      acc[sensor.name] = sensor.read();
      return acc;
    }, {});
  }

  sample(name) {
    const sensor = this.activeSensors.find((s) => s.name === name);
    if (sensor) {
      sensor.sample();
    }
  }

  read(name) {
    const sensor = this.activeSensors.find((s) => s.name === name);
    return sensor.read();
  }

  sampleOnEvent(event) {
    this.activeSensors.forEach((sensor) => {
      if (sensor.type === event) {
        sensor.sample();
      }
    });
  }

  update() {
    this.sampleOnEvent('update');
  }

  start() {
    this.sampleOnEvent('start');
  }
}
