import { sensorSamplingTypes } from './sensorManager';

const name = 'prevPosition';

// Function based sensor implementation
const PrevPositionSensor = (robot) => {
  const type = sensorSamplingTypes.onUpdate;
  const dependencies = [];

  // private
  let value = null;

  const sample = () => {
    value = { ...robot.sensorValues.position };
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
