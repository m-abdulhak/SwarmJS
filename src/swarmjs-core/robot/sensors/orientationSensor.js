import { sensorSamplingTypes } from './sensorManager';
import { normalizeAngle } from '../../geometry';

const name = 'orientation';

const OrientationSensor = (robot) => {
  const type = sensorSamplingTypes.onRequest;
  const dependencies = [];

  const { body } = robot;
  let value = { x: null, y: null };

  const sample = () => {
    value = normalizeAngle(body.angle);
  };

  const read = () => value;

  return {
    name,
    type,
    dependencies,
    sample,
    read
  };
};

export default {
  name,
  Sensor: OrientationSensor
};
