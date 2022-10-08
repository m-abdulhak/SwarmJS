import Sensor from '../sensor';
import { sensorSamplingTypes } from '../sensorManager';
import { normalizeAngle } from '../../../utils/geometry';

const name = 'orientation';

class OrientationSensor extends Sensor {
  constructor(robot, scene) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.value = null;
  }

  sample() {
    const angle = this.robot.body.angle && typeof this.robot.body.angle === 'number'
      ? this.robot.body.angle : this.robot.sensors.orientation;
    this.value = normalizeAngle(angle);
  }
}

export default {
  name,
  Sensor: OrientationSensor
};
