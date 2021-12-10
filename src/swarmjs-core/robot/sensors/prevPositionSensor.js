import { sensorSamplingTypes } from './sensorManager';

const name = 'prevPosition';

const PrevPositionSensor = (robot) => {
  const type = sensorSamplingTypes.onUpdate;
  const dependencies = [];

  let value = { x: null, y: null };

  const sample = () => {
    value = { ...robot.sense('position') };
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
  Sensor: PrevPositionSensor
};
