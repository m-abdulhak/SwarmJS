/* eslint-disable import/no-cycle */
import Sensor from '../sensor';
import { sensorSamplingTypes, CoreSensors } from '../sensorManager';

const name = 'nearbyPucks';

class NearbyPucksSensor extends Sensor {
  constructor(robot, scene) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [CoreSensors.position];
    this.value = [];

    this.MAX_NEARBY_DISTANCE = robot.radius * 20;
  }

  sample() {
    this.value = this.scene?.pucks?.filter(
      (p) => !p.held && this.robot.getDistanceTo(p.position) < this.MAX_NEARBY_DISTANCE
    );
  }
}

export default {
  name,
  Sensor: NearbyPucksSensor
};
