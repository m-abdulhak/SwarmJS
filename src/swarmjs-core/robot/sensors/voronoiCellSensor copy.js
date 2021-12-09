import { sensorSamplingTypes } from './sensorManager';

const name = 'VC';

const VoronoiCellSensor = (robot, scene) => {
  const type = sensorSamplingTypes.onUpdate;
  const dependencies = [];

  // private
  let value = [];

  const sample = () => {
    value = [...scene.voronoi.cellPolygon(robot.id)];
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
  Sensor: VoronoiCellSensor
};
