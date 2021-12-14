import Sensor from '../sensor';
import { availableSensors, sensorSamplingTypes } from '../sensorManager';

const name = 'reachedGoal';

class ReachedGoalSensor extends Sensor {
  constructor(robot, scene) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [availableSensors.position];
    this.value = false;
  }

  sample() {
    this.value = this.robot.reached(this.robot.goal);
  }
}

export default {
  name,
  Sensor: ReachedGoalSensor
};
