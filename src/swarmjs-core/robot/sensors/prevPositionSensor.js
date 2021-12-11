import Sensor from './sensor';
import { sensorSamplingTypes } from './sensorManager';

const name = 'prevPosition';

class PrevPositionSensor extends Sensor {
  constructor(robot, scene) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.value = { x: null, y: null };
  }

  sample() {
    this.value = { ...this.robot.sense('position') };
  }
}

export default {
  name,
  Sensor: PrevPositionSensor
};
