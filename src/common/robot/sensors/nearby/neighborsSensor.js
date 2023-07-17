/* eslint-disable import/no-cycle */
import Sensor from '../sensor';
import { sensorSamplingTypes, CoreSensors } from '../sensorManager';

const name = 'neighbors';

const getNeighbors = (scene, robotId, robot) => {
  let neighbors = [];
  try {
    if (scene.voronoi?.delaunay) {
      Array.from(scene.voronoi?.delaunay.neighbors(robotId))
        .filter((x) => x > -1)
        .forEach((i) => neighbors.push(scene.robots[i]));
    } else {
      neighbors = (scene.robots || [])
        .filter((r) => r.id === robotId)
        .filter((r) => robot.getDistanceTo(r.sensors.position) < robot.radius * 10);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`Error Extracting Neighbors for robot ${robotId}: ${error}`);
  }

  return neighbors;
};

class NeighborsSensor extends Sensor {
  constructor(robot, scene) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [CoreSensors.position];
    this.value = [];
  }

  sample() {
    this.value = getNeighbors(this.scene, this.robot.id, this.robot);
  }
}

export default {
  name,
  Sensor: NeighborsSensor
};
