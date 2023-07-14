/* eslint-disable import/no-cycle */
import Sensor from '../sensor';
import { sensorSamplingTypes } from '../sensorManager';

const name = 'envBounds';

class EnvironmentBoundsSensor extends Sensor {
  constructor(robot, scene) {
    super(robot, scene, name, sensorSamplingTypes.onStart);
    this.value = [];
  }

  sample() {
    this.value = [
      { x: 0, y: 0 },
      { x: this.scene.width, y: 0 },
      { x: this.scene.width, y: this.scene.height },
      { x: 0, y: this.scene.height },
      { x: 0, y: 0 }
    ];
  }
}

export default {
  name,
  Sensor: EnvironmentBoundsSensor
};
