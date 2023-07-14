/* eslint-disable import/no-cycle */
import Sensor from '@common/robot/sensors/sensor';
import { sensorSamplingTypes, CoreSensors } from '@common/robot/sensors/sensorManager';
import { getDistance } from '@common/utils/geometry';

import pucksNearGrabberSensor from './pucksNearGrabberSensor';

const name = 'closestPuckToGrabber';

class ClosestPuckToGrabber extends Sensor {
  constructor(robot, scene) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [
      CoreSensors.heading,
      pucksNearGrabberSensor
    ];
    this.value = [];
  }

  sample() {
    const pucks = this.robot.sensors.pucksNearGrabber;

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
  Sensor: ClosestPuckToGrabber
};
