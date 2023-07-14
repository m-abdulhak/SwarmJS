/* eslint-disable import/no-cycle */
import Sensor from '../sensor';
import { sensorSamplingTypes, CoreSensors } from '../sensorManager';
import { getAbsolutePointFromDistanceAndAngle } from '../../../utils/geometry';

const name = 'heading';

class HeadingSensor extends Sensor {
  constructor(robot, scene) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [
      CoreSensors.position,
      CoreSensors.orientation
    ];
    this.value = { x: null, y: null };
  }

  sample() {
    this.value = getAbsolutePointFromDistanceAndAngle(
      this.robot.sensors.position,
      this.robot.radius * 1.2,
      this.robot.sensors.orientation
    );
  }
}

export default {
  name,
  Sensor: HeadingSensor
};
