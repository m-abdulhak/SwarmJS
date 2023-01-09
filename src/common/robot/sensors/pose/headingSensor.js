import Sensor from '../sensor';
import { sensorSamplingTypes, AvailableSensors } from '../sensorManager';
import { getAbsolutePointFromDistanceAndAngle } from '../../../utils/geometry';

const name = 'heading';

class HeadingSensor extends Sensor {
  constructor(robot, scene) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [
      AvailableSensors.position,
      AvailableSensors.orientation
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
