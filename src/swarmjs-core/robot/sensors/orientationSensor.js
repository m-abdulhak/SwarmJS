import Sensor from './sensor';
import { sensorSamplingTypes } from './sensorManager';
import { normalizeAngle } from '../../geometry';

const name = 'orientation';

class OrientationSensor extends Sensor {
  constructor(robot, scene) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.value = null;
  }

  sample() {
    this.value = normalizeAngle(this.robot.body.angle);
  }
}

export default {
  name,
  Sensor: OrientationSensor
};
