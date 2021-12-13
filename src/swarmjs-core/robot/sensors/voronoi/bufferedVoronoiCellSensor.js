import Offset from 'polygon-offset';

import Sensor from '../sensor';
import { sensorSamplingTypes, availableSensors } from '../sensorManager';

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

class BufferedVoronoiCellSensor extends Sensor {
  constructor(robot, scene) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [
      availableSensors.position,
      availableSensors.obstaclesAwareVoronoiCell
    ];
    this.value = [];
  }

  sample() {
    const cell = this.robot.sense('obstaclesAwareVoronoiCell');
    const pos = this.robot.sense('position');

    if (cell == null || cell.length < 3) {
      return;
    }

    this.value = calculateBVCfromVC(
      cell,
      pos,
      this.robot.radius
    );
  }
}

export default {
  name,
  Sensor: BufferedVoronoiCellSensor
};
