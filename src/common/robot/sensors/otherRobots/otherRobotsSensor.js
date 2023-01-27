import Sensor from '../sensor';
import { sensorSamplingTypes, CoreSensors as CoreSensors } from '../sensorManager';
import { getDistance } from '@common/utils/geometry';

const name = 'otherRobots';

class OtherRobotsSensor extends Sensor {
  constructor(robot, scene, { detectionRadius } = {}) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [
      CoreSensors.neighbors
    ];
    this.value = 0;

    this.DETECTION_RADIUS = detectionRadius == null ? robot.radius * 2 : detectionRadius;
  }

  sample() {
    this.value = 0;

    for (const neighbor of this.robot.sensors.neighbors) {
        const distance = getDistance(this.robot.sensors.directions.forward, neighbor.body.position);
        if (distance - neighbor.radius < this.DETECTION_RADIUS) {
            this.value += 1;
        }
    }
  }
}

export default {
  name,
  Sensor: OtherRobotsSensor
};