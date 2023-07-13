/* eslint-disable import/no-cycle */
import Sensor from '../sensor';
import { sensorSamplingTypes } from '../sensorManager';
import { getSceneDefinedPoints } from '../sensorUtils';
import { getDistance } from '../../../utils/geometry';
// import { distanceBetweenPointAndLine } from '../../../utils/geometry';

const name = 'circles';

// const getObjEdges = (obj) => {
//   const { vertices } = obj;
//   return vertices.map((v, i) => ([v, vertices[(i + 1) % vertices.length]]));
// };

class CirclesSensor extends Sensor {
  constructor(robot, scene, { regions = [] } = {}) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [];
    // this.dependencies = [
    //  CoreSensors.position
    // ];
    this.value = [];

    this.regions = regions;
  }

  sample() {
    for (const region of this.regions) {
      this.value[region.name] = this.sampleRegion(region);
    }
  }

  sampleRegion(region) {
    const centre = getSceneDefinedPoints(region.centre, this.robot.sensors).coords;

    const reading = {};

    // Test against walls.
    if (region.sensedTypes.includes('walls')) {
      reading.walls = 0;

      /*
      const envBoundaryObjects = this.scene.envBoundaryObjects;
      const allEdges = envBoundaryObjects
        .map((obj) => getObjEdges(obj))
        .reduce((acc, objEdges) => [...acc, ...objEdges], []);
      const wallCloseToSensingPoint = allEdges.some((edge) => {
        const dist = distanceBetweenPointAndLine(centre, edge[0], edge[1]);
        return dist < region.radius;
      });
      if (wallCloseToSensingPoint) {
        reading.walls++;
      }
      */

      // The test above can fail when the sensing circle is outside the arena.
      // So we explicitly test for this condition.
      if (centre.x - region.radius < 0 || centre.x + region.radius > this.scene.width
          || centre.y - region.radius < 0 || centre.y + region.radius > this.scene.height) {
        reading.walls += 1;
      }
    }

    // Test against other robots.
    if (region.sensedTypes.includes('robots')) {
      reading.robots = this.scene?.robots?.filter(
        (robot) => (
          (robot.id !== this.robot.id)
          && (getDistance(centre, robot.body.position) - robot.radius < region.radius)
        )
      ).length;
    }

    // Test against pucks.
    if (region.sensedTypes.includes('pucks')) {
      reading.pucks = this.scene?.pucks?.filter(
        (puck) => !puck.held && getDistance(centre, puck.position) - puck.radius < region.radius
      ).length;
    }

    return { reading, centre, radius: region.radius };
  }
}

export default {
  name,
  Sensor: CirclesSensor
};
