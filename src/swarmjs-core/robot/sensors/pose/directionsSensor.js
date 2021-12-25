// This sensor calculates the points on all directions relative to the robot.
// Usefull for controllers to easily set a heading direction depending on sensor readings.

import Sensor from '../sensor';
import { sensorSamplingTypes, availableSensors } from '../sensorManager';
import { getAbsolutePointFromLengthAndAngle } from '../../../utils/geometry';

const name = 'directions';
const directionsDefinitions = {
  forward: 0,
  right: Math.PI / 2,
  left: -Math.PI / 2,
  forwardRight: Math.PI / 4,
  forwardLeft: -Math.PI / 4,
  backwardRight: (3 * Math.PI) / 4,
  backwardLeft: -(3 * Math.PI) / 4,
  backward: Math.PI
};

class DirectionsSensor extends Sensor {
  constructor(robot, scene) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [
      availableSensors.position,
      availableSensors.orientation
    ];
    this.value = Object.keys(directionsDefinitions).reduce((acc, direction) => {
      acc[direction] = { x: null, y: null };
      return acc;
    }, {});
  }

  sample() {
    this.value = Object.keys(directionsDefinitions).reduce((acc, direction) => {
      const angle = this.robot.sensors.orientation + directionsDefinitions[direction];
      acc[direction] = getAbsolutePointFromLengthAndAngle(
        this.robot.sensors.position, this.robot.radius * 2, angle
      );
      return acc;
    }, {});
  }
}

export default {
  name,
  Sensor: DirectionsSensor
};
