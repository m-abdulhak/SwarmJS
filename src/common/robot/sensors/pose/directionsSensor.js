/* eslint-disable import/no-cycle */
// This sensor calculates the points on all directions relative to the robot.
// Useful for controllers to easily set a heading direction depending on sensor readings.

import Sensor from '../sensor';
import { sensorSamplingTypes, CoreSensors } from '../sensorManager';
import { getAbsolutePointFromDistanceAndAngle } from '../../../utils/geometry';

const name = 'directions';
const directionsDefinitions = {
  forward: 0,
  forwardRight: Math.PI / 4,
  right: Math.PI / 2,
  backwardRight: (3 * Math.PI) / 4,
  backward: Math.PI,
  backwardLeft: -(3 * Math.PI) / 4,
  left: -Math.PI / 2,
  forwardLeft: -Math.PI / 4
};

class DirectionsSensor extends Sensor {
  constructor(robot, scene) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [
      CoreSensors.position,
      CoreSensors.orientation
    ];
    this.value = Object.keys(directionsDefinitions).reduce((acc, direction) => {
      acc[direction] = { x: null, y: null };
      return acc;
    }, {});
  }

  sample() {
    this.value = Object.keys(directionsDefinitions).reduce((acc, direction) => {
      const angle = this.robot.sensors.orientation + directionsDefinitions[direction];
      acc[direction] = getAbsolutePointFromDistanceAndAngle(
        this.robot.sensors.position,
        this.robot.radius * 2,
        angle
      );
      return acc;
    }, {});
  }
}

export default {
  name,
  Sensor: DirectionsSensor
};
