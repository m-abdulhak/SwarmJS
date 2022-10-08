import Sensor from '../sensor';
import { AvailableSensors, sensorSamplingTypes } from '../sensorManager';

const name = 'reachedGoal';

class ReachedGoalSensor extends Sensor {
  constructor(robot, scene) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [AvailableSensors.position];
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
