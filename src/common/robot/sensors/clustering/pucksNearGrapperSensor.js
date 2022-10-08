import Sensor from '../sensor';
import { sensorSamplingTypes, AvailableSensors } from '../sensorManager';
import { getDistance } from '../../../utils/geometry';

const name = 'pucksNearGrapper';

class PucksNearGrapperSensor extends Sensor {
  constructor(robot, scene) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [
      AvailableSensors.position,
      AvailableSensors.heading,
      AvailableSensors.nearbyPucks
    ];
    this.value = [];

    this.MAX_NEARBY_DISTANCE = robot.radius * 4;
  }

  sample() {
    this.value = this.robot.sensors.nearbyPucks?.filter((puck) => {
      const robotToPuck = this.robot.getDistanceTo(puck.position);
      const grapperToPuck = getDistance(this.robot.sensors.heading, puck.position);
      const isCloseEnough = grapperToPuck < this.MAX_NEARBY_DISTANCE;
      return grapperToPuck < robotToPuck && isCloseEnough;
    });
  }
}

export default {
  name,
  Sensor: PucksNearGrapperSensor
};
