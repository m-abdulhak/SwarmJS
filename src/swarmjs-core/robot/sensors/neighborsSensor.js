import { sensorSamplingTypes, availableSensors } from './sensorManager';

const name = 'neighbors';

const NeighborsSensor = (robot, scene) => {
  const type = sensorSamplingTypes.onUpdate;
  const dependencies = [availableSensors.position];

  let value = [];
  const getNeighbors = () => {
    const neighbors = [];
    try {
      const indexes = Array.from(scene.voronoi.delaunay.neighbors(robot.id))
        .filter((x) => x > -1);

      indexes.forEach((i) => neighbors.push(scene.robots[i]));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`Error Exracting Neighbors: ${error}`);
    }

    return neighbors;
  };

  const sample = () => {
    value = getNeighbors();
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
  Sensor: NeighborsSensor
};
