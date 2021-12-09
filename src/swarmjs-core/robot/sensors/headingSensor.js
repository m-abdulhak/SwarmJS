import { sensorSamplingTypes, availableSensors } from './sensorManager';
import { getAbsolutePointFromLengthAndAngle } from '../../geometry';

const name = 'heading';

const HeadingSensor = (robot) => {
  const type = sensorSamplingTypes.onUpdate;
  const dependencies = [
    availableSensors.position,
    availableSensors.orientation
  ];

  let value = { x: null, y: null };

  const sample = () => {
    value = getAbsolutePointFromLengthAndAngle(
      robot.sense('position'), robot.radius * 1.2, robot.sense('orientation')
    );
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
  Sensor: HeadingSensor
};
