import { sensorSamplingTypes } from './sensorManager';

const name = 'envBounds';

const EnvironmentBoundsSensor = (robot, scene) => {
  const type = sensorSamplingTypes.onStart;
  const dependencies = [];

  let value = [];

  const sample = () => {
    value = [
      { x: 0, y: 0 },
      { x: scene.width, y: 0 },
      { x: scene.width, y: scene.height },
      { x: 0, y: scene.height },
      { x: 0, y: 0 }
    ];
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
  Sensor: EnvironmentBoundsSensor
};
