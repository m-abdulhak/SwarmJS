/* eslint-disable no-console */
import Sensor from '../sensor';
import { sensorSamplingTypes, AvailableSensors } from '../sensorManager';
import { getSceneDefinedPointDefinitions, getSceneDefinedPoints } from '../sensorUtils';

const name = 'fields';

const sampleFieldAtPoint = (context, p) => {
  if (!context?.getImageData || typeof context.getImageData !== 'function') {
    return null;
  }

  if (p.x < 0 || p.y < 0 || p.x >= context.canvas.width || p.y >= context.canvas.width) {
    return [0, 0, 0, 0];
  }

  const imageVal = context.getImageData(p.x, p.y, 1, 1);
  return imageVal.data;
};

class FieldSensor extends Sensor {
  constructor(robot, scene, { points = [] } = {}) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [
      AvailableSensors.position,
      AvailableSensors.directions
    ];
    this.value = [];

    this.sceneDefinedSensingPointsDefinitions = getSceneDefinedPointDefinitions(points);
  }

  sample() {
    this.sceneDefinedSensingPoints = getSceneDefinedPoints(this.sceneDefinedSensingPointsDefinitions, this.robot.sensors);

    const res = {};

    Object.entries(this.scene.fields).forEach(([fieldKey, field]) => {
      res[fieldKey] = {};

      Object.entries(this.sceneDefinedSensingPoints).forEach(([key, sensingPoint]) => {
        if (!field.src) {
          res[fieldKey][key] = null;
          return;
        }
        const fieldValue = sampleFieldAtPoint(field.src, sensingPoint);
        res[fieldKey][key] = fieldValue;
      });
    });

    this.value = {
        readings: res,
        sensingPoints: this.sceneDefinedSensingPoints
    };
  }
}

export default {
  name,
  Sensor: FieldSensor
};
