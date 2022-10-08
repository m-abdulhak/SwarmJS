import Sensor from '../sensor';
import { sensorSamplingTypes, AvailableSensors } from '../sensorManager';

const name = 'neighbors';

const getNeighbors = (scene, robotId) => {
  const neighbors = [];
  try {
    if (scene.voronoi?.delaunay) {
      Array.from(scene.voronoi?.delaunay.neighbors(robotId))
        .filter((x) => x > -1)
        .forEach((i) => neighbors.push(scene.robots[i]));
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`Error Exracting Neighbors for robot ${robotId}: ${error}`);
  }

  return neighbors;
};

class NeighborsSensor extends Sensor {
  constructor(robot, scene) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [AvailableSensors.position];
    this.value = [];
  }

  sample() {
    this.value = getNeighbors(this.scene, this.robot.id);
  }
}

export default {
  name,
  Sensor: NeighborsSensor
};
