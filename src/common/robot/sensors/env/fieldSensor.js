/* eslint-disable import/no-cycle */
/* eslint-disable no-console */
import Sensor from '../sensor';
import { sensorSamplingTypes, CoreSensors } from '../sensorManager';
import { getSceneDefinedPointDefinitions, getSceneDefinedPoints } from '../sensorUtils';
import { sampleFieldAtPoint } from '../../../utils/canvasUtils';

const name = 'fields';

class FieldSensor extends Sensor {
  constructor(robot, scene, { points = [] } = {}) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [
      CoreSensors.position,
      CoreSensors.directions
    ];
    this.value = [];

    this.sceneDefinedSensingPointsDefinitions = getSceneDefinedPointDefinitions(points);
  }

  sample() {
    this.sceneDefinedSensingPoints = getSceneDefinedPoints(
      this.sceneDefinedSensingPointsDefinitions,
      this.robot.sensors
    );

    const res = {};

    Object.entries(this.scene.fields || {}).forEach(([fieldKey, field]) => {
      res[fieldKey] = {};

      Object.entries(this.sceneDefinedSensingPoints).forEach(([key, sensingPoint]) => {
        if (!field.context) {
          res[fieldKey][key] = null;
          return;
        }
        const fieldValue = sampleFieldAtPoint(field.context, sensingPoint);
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
