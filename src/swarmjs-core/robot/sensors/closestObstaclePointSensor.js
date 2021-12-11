import Sensor from './sensor';
import { sensorSamplingTypes, availableSensors } from './sensorManager';

const name = 'closestObstaclePoint';

class ClosestObstaclePointSensor extends Sensor {
  constructor(robot, scene) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [
      availableSensors.position,
      availableSensors.nearbyObstacles
    ];
    this.value = [];
  }

  sample() {
    const pos = this.robot.sense('position');
    const points = this.robot.sense('nearbyObstacles')
      .map((staticObs) => staticObs.getIntersectionPoint(pos));

    if (points.length === 0) {
      this.value = null;
    }

    this.value = points.reduce((acc, point) => {
      if (acc === null || this.robot.getDistanceTo(point) < this.robot.getDistanceTo(acc)) {
        return point;
      }
      return acc;
    }, null);
  }
}

export default {
  name,
  Sensor: ClosestObstaclePointSensor
};
