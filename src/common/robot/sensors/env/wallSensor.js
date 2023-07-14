/* eslint-disable import/no-cycle */
import Sensor from '../sensor';
import { sensorSamplingTypes, CoreSensors } from '../sensorManager';
import { distanceBetweenPointAndLine } from '../../../utils/geometry';

const name = 'walls';

const getObjEdges = (obj) => {
  const { vertices } = obj;
  return vertices.map((v, i) => ([v, vertices[(i + 1) % vertices.length]]));
};

class WallSensor extends Sensor {
  constructor(robot, scene, { detectionRadius } = {}) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [
      CoreSensors.position,
      CoreSensors.directions
    ];
    this.value = [];

    this.DETECTION_RADIUS = detectionRadius == null ? robot.radius : detectionRadius;
  }

  sample() {
    // Get All points where walls need to be detected
    const sensingPoints = {
      forward: this.robot.sensors.directions.forward,
      backward: this.robot.sensors.directions.backward,
      left: this.robot.sensors.directions.left,
      right: this.robot.sensors.directions.right
    };

    // Get all obstacles from the environment boundary
    // TODO: expand this to include static objects ?
    const envBoundaryObjects = this.scene.envBoundaryObjects;

    // Get all walls (edges) from the environment boundaries' objects
    const allEdges = envBoundaryObjects
      .map((obj) => getObjEdges(obj))
      .reduce((acc, objEdges) => [...acc, ...objEdges], []);

    const res = [];

    Object.entries(sensingPoints).forEach(([key, sensingPoint]) => {
      const wallCloseToSensingPoint = allEdges.some((edge) => {
        const dist = distanceBetweenPointAndLine(sensingPoint, edge[0], edge[1]);
        return dist < this.DETECTION_RADIUS;
      });
      if (wallCloseToSensingPoint) {
        res.push(key);
      }
    });

    this.value = res;
  }
}

export default {
  name,
  Sensor: WallSensor
};
