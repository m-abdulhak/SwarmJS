import Sensor from '../sensor';
import { sensorSamplingTypes, CoreSensors } from '../sensorManager';
import { getSceneDefinedPoints } from '../sensorUtils';
import { distanceBetweenPointAndLine, getDistance } from '../../../utils/geometry';

const name = 'circles';

const getObjEdges = (obj) => {
  const { vertices } = obj;
  return vertices.map((v, i) => ([v, vertices[(i + 1) % vertices.length]]));
};

class CirclesSensor extends Sensor {
  constructor(robot, scene, { areas = [] } = {}) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [];
    this.value = [];

    this.areas = areas;
  }

  sample() {
    for (const area of this.areas) {
      this.value[area.name] = this.sampleArea(area)
    }
  }

  sampleArea(area) {
    let centre = getSceneDefinedPoints(area.centre, this.robot.sensors).coords;

    const reading = {};

    // Test against walls.
    if (area.sensedTypes.includes('walls')) {
      reading.walls = 0;

      /*
      const envBoundaryObjects = this.scene.envBoundaryObjects;
      const allEdges = envBoundaryObjects
        .map((obj) => getObjEdges(obj))
        .reduce((acc, objEdges) => [...acc, ...objEdges], []);
      const wallCloseToSensingPoint = allEdges.some((edge) => {
        const dist = distanceBetweenPointAndLine(centre, edge[0], edge[1]);
        return dist < area.radius;
      });
      if (wallCloseToSensingPoint) {
        reading.walls++;
      }
      */

      // The test above can fail when the sensing circle is outside the arena.
      // So we explicitly test for this condition.
      if (centre.x - area.radius < 0 || centre.x + area.radius > this.scene.width ||
          centre.y - area.radius < 0 || centre.y + area.radius > this.scene.height) {
        reading.walls++;
      }
    }


    // Test against other robots.
    if (area.sensedTypes.includes('robots')) {
      reading.robots = this.scene?.robots?.filter(
              (robot) => (robot.id != this.robot.id) && getDistance(centre, robot.body.position) - robot.radius < area.radius
            ).length;
    }

    // Test against pucks.
    if (area.sensedTypes.includes('pucks')) {
      reading.pucks = this.scene?.pucks?.filter(
              (puck) => !puck.held && getDistance(centre, puck.position) - puck.radius < area.radius
            ).length;
    }

    return { reading: reading, centre: centre, radius: area.radius };
  }
}

export default {
  name,
  Sensor: CirclesSensor
};