import Sensor from '../sensor';
import { sensorSamplingTypes, availableSensors } from '../sensorManager';
import { getAbsolutePointFromLengthAndAngle } from '../../../utils/geometry';

const name = 'heading';

class HeadingSensor extends Sensor {
  constructor(robot, scene) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [
      availableSensors.position,
      availableSensors.orientation
    ];
    this.value = { x: null, y: null };
  }

  sample() {
    this.value = getAbsolutePointFromLengthAndAngle(
      this.robot.sense('position'), this.robot.radius * 1.2, this.robot.sense('orientation')
    );
  }
}

export default {
  name,
  Sensor: HeadingSensor
};
