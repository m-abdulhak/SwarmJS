/* eslint-disable no-console */
import Sensor from '../sensor';
import { sensorSamplingTypes, AvailableSensors } from '../sensorManager';
import { getPolarCoordsFromCartesian, getAbsolutePointFromDistanceAndAngle } from '../../../utils/geometry';

const name = 'fields';

const sampleFieldAtPoint = (context, p) => {
  if (!context?.getImageData || typeof context.getImageData !== 'function') {
    return null;
  }

  if (p.x < 0 || p.y < 0 || p.x >= context.canvas.width || p.y >= context.canvas.width) {
    return null;
  }

  const imageVal = context.getImageData(p.x, p.y, 1, 1);
  return imageVal.data;
};

class FieldSensor extends Sensor {
  constructor(robot, scene, { points = [] } = {}) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [
      AvailableSensors.position,
      AvailableSensors.directions
    ];
    this.value = [];

    this.sceneDefinedSensingPointsDefinitions = points.reduce((acc, pDef) => {
      if (!pDef.name || !pDef.coords || !pDef.type || (pDef.type !== 'Cartesian' && pDef.type !== 'Polar')) {
        console.error('Unrecognized point definitinon:', pDef);
        return acc;
      }
      if (pDef.type === 'Cartesian') {
        const coords = getPolarCoordsFromCartesian(pDef.coords.x, pDef.coords.y);

        // Keep compatibility with other angles using positive angle direction as clockwise
        coords.angle *= -1;

        acc[pDef.name] = coords;
        return acc;
      }
      if (pDef.type === 'Polar') {
        acc[pDef.name] = pDef.coords;
        return acc;
      }
      return acc;
    }, {});
  }

  sample() {
    this.sceneDefinedSensingPoints = Object.entries(this.sceneDefinedSensingPointsDefinitions)
      .reduce((acc, [pointDefKey, pointDef]) => {
        const angle = this.robot.sensors.orientation + pointDef.angle;
        const distance = pointDef.distance;
        acc[pointDefKey] = getAbsolutePointFromDistanceAndAngle(
          this.robot.sensors.position,
          distance,
          angle
        );

        return acc;
      }, {});

    const sensingPoints = {
      center: this.robot.sensors.position,
      //...this.robot.sensors.directions,
      ...this.sceneDefinedSensingPoints
    };

    const res = {};

    Object.entries(this.scene.fields).forEach(([fieldKey, field]) => {
      res[fieldKey] = {};

      Object.entries(sensingPoints).forEach(([key, sensingPoint]) => {
        if (!field.src) {
          res[fieldKey][key] = null;
          return;
        }
        const fieldValue = sampleFieldAtPoint(field.src, sensingPoint);
        res[fieldKey][key] = fieldValue;
      });
    });

    this.value = res;
  }
}

export default {
  name,
  Sensor: FieldSensor
};
