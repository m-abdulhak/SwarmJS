import Sensor from '../sensor';
import { sensorSamplingTypes, AvailableSensors } from '../sensorManager';
import { getDistance } from '../../../utils/geometry';

const name = 'closestPuckToGrapper';

class ClosestPuckToGrapper extends Sensor {
  constructor(robot, scene) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [
      AvailableSensors.heading,
      AvailableSensors.pucksNearGrapper
    ];
    this.value = [];
  }

  sample() {
    const pucks = this.robot.sensors.pucksNearGrapper;

    this.value = pucks?.reduce((acc, p) => {
      if (acc === null) {
        return p;
      }

      const pDist = getDistance(this.robot.sensors.heading, p.position);
      const accDist = getDistance(this.robot.sensors.heading, acc.position);
      return pDist < accDist ? p : acc;
    }, null);
  }
}

export default {
  name,
  Sensor: ClosestPuckToGrapper
};
