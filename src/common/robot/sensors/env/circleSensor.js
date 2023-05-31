import Sensor from '../sensor';
import { sensorSamplingTypes, CoreSensors } from '../sensorManager';
import { getSceneDefinedPointDefinitions, getSceneDefinedPoints } from '../sensorUtils';
import { distanceBetweenPointAndLine, getDistance } from '../../../utils/geometry';

const name = 'circles';

const getObjEdges = (obj) => {
  const { vertices } = obj;
  return vertices.map((v, i) => ([v, vertices[(i + 1) % vertices.length]]));
};

class CircleSensor extends Sensor {
  constructor(robot, scene, { detectionRadius, centres = [] } = {}) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [
      CoreSensors.position,
      CoreSensors.directions
    ];
    this.value = [];

    this.DETECTION_RADIUS = detectionRadius == null ? robot.radius : detectionRadius;

    this.sceneDefinedSensingPointsDefinitions = getSceneDefinedPointDefinitions(centres);
  }

  sample() {
    this.sceneDefinedSensingPoints = getSceneDefinedPoints( this.sceneDefinedSensingPointsDefinitions, this.robot.sensors);

    // Get all obstacles from the environment boundary
    // TODO: expand this to include static objects ?
    const envBoundaryObjects = this.scene.envBoundaryObjects;

    // Get all walls (edges) from the environment boundaries' objects
    const allEdges = envBoundaryObjects
      .map((obj) => getObjEdges(obj))
      .reduce((acc, objEdges) => [...acc, ...objEdges], []);

    const reading = {walls: 0, robots: 0, pucks: 0};

    Object.entries(this.sceneDefinedSensingPoints).forEach(([key, sensingPoint]) => {

      // Test against walls.
      const wallCloseToSensingPoint = allEdges.some((edge) => {
        const dist = distanceBetweenPointAndLine(sensingPoint, edge[0], edge[1]);
        return dist < this.DETECTION_RADIUS;
      });
      if (wallCloseToSensingPoint) {
        reading.walls++;
      }

      // Test against other robots.
      for (const neighbor of this.robot.sensors.neighbors) {
        const distance = getDistance(sensingPoint, neighbor.body.position);
        if (distance - neighbor.radius < this.DETECTION_RADIUS) {
          reading.robots++;
        }
      }

      // Test against pucks.
      reading.pucks = this.scene?.pucks?.filter(
              (puck) => !puck.held && getDistance(sensingPoint, puck.position) - puck.radius < this.DETECTION_RADIUS
            ).length;
    });

    this.value = { reading: reading, centre: this.sceneDefinedSensingPoints[0] };
  }
}

export default {
  name,
  Sensor: CircleSensor
};