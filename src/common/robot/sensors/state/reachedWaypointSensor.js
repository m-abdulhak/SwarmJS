/* eslint-disable import/no-cycle */
import Sensor from '../sensor';
import { CoreSensors, sensorSamplingTypes } from '../sensorManager';

const name = 'reachedWaypoint';

class ReachedWaypointSensor extends Sensor {
  constructor(robot, scene) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [CoreSensors.position];
    this.value = false;
  }

  sample() {
    this.value = this.robot.reached(this.robot.waypoint);
  }
}

export default {
  name,
  Sensor: ReachedWaypointSensor
};
