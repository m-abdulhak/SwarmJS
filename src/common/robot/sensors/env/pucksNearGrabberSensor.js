/* eslint-disable import/no-cycle */
import Sensor from '@common/robot/sensors/sensor';
import { sensorSamplingTypes, CoreSensors, ExtraSensors } from '@common/robot/sensors/sensorManager';
import { getDistance } from '@common/utils/geometry';

const name = 'pucksNearGrabber';

class PucksNearGrabberSensor extends Sensor {
  constructor(robot, scene) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [
      CoreSensors.position,
      CoreSensors.heading,
      ExtraSensors.nearbyPucks
    ];
    this.value = [];

    this.MAX_NEARBY_DISTANCE = robot.radius * 4;
  }

  sample() {
    // EXAMPLE: using misc objects passed from config in sensors
    // console.log('sceneSpecificMap in sensor:', this.robot.sceneSpecificMap);
    this.value = this.robot.sensors.nearbyPucks?.filter((puck) => {
      const robotToPuck = this.robot.getDistanceTo(puck.position);
      const grabberToPuck = getDistance(this.robot.sensors.heading, puck.position);
      const isCloseEnough = grabberToPuck < this.MAX_NEARBY_DISTANCE;
      return grabberToPuck < robotToPuck && isCloseEnough;
    });
  }
}

export default {
  name,
  Sensor: PucksNearGrabberSensor
};
