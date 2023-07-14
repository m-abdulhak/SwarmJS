/* eslint-disable import/no-cycle */
import Sensor from '../sensor';
import { CoreSensors, sensorSamplingTypes } from '../sensorManager';

const name = 'puckGoalAreaSensor';

class PuckGoalAreaSensor extends Sensor {
  constructor(robot, scene) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [CoreSensors.position];
    this.value = false;
  }

  sample() {
    let curGoalArea = null;

    this.scene.pucksGroups.forEach((group) => {
      if (this.robot.getDistanceTo(group.goal) < group.goalRadius) {
        curGoalArea = group.color;
      }
    });
    this.value = curGoalArea;
  }
}

export default {
  name,
  Sensor: PuckGoalAreaSensor
};
