import Offset from 'polygon-offset';

import { sensorSamplingTypes, availableSensors } from './sensorManager';

const name = 'BVC';

const calculateBVCfromVC = (cell, position, radius) => {
  const offset = new Offset();
  let padding = [];
  try {
    [padding] = offset.data(cell).padding(radius * 1);
  } catch (err) {
    // On collisions, if voronoi cell is too small => BVC is undefined
    // Should not occur in collision-free configurations
    // eslint-disable-next-line no-console
    console.log(`Error calculating BVC:  ${err}`);
    padding = [[position.x, position.y]];
  }

  return padding;
};

const BufferedVoronoiCellSensor = (robot) => {
  const type = sensorSamplingTypes.onUpdate;
  const dependencies = [
    availableSensors.position,
    availableSensors.voronoiCell
  ];

  let value = [];

  const sample = () => {
    const cell = robot.sense('voronoiCell');
    const pos = robot.sense('position');

    if (cell == null || cell.length < 3) {
      return;
    }

    value = calculateBVCfromVC(
      cell,
      pos,
      robot.radius
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
  Sensor: BufferedVoronoiCellSensor
};
