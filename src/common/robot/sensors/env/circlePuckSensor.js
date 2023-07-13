/* eslint-disable no-console */
import Sensor from '../sensor';
import { sensorSamplingTypes, CoreSensors } from '../sensorManager';
import { getSceneDefinedPointDefinitions, getSceneDefinedPoints } from '../sensorUtils';
import { getDistance } from '../../../utils/geometry';

const name = 'circlePucks';

class CirclePuckSensor extends Sensor {
  constructor(robot, scene, { detectionRadius, points = [] } = {}) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [
      CoreSensors.position,
      CoreSensors.directions
    ];
    this.value = [];

    this.DETECTION_RADIUS = detectionRadius == null ? robot.radius * 2 : detectionRadius;

    this.sceneDefinedSensingPointsDefinitions = getSceneDefinedPointDefinitions(points);
  }

  sample() {
    this.sceneDefinedSensingPoints = getSceneDefinedPoints(
      this.sceneDefinedSensingPointsDefinitions,
      this.robot.sensors
    );

    const res = {};

    Object.entries(this.sceneDefinedSensingPoints).forEach(([key, sensingPoint]) => {
      res[key] = this.scene?.pucks?.filter(
        (puck) => !puck.held && getDistance(sensingPoint, puck.position) - puck.radius < this.DETECTION_RADIUS
      ).length;
    });

    this.value = {
      readings: res,
      sensingPoints: this.sceneDefinedSensingPoints
    };
  }
}

export default {
  name,
  Sensor: CirclePuckSensor
};
