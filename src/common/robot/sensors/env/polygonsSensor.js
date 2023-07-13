/* eslint-disable import/no-cycle */
/* eslint-disable no-console */
import Sensor from '../sensor';
import { sensorSamplingTypes, CoreSensors } from '../sensorManager';
import { getSceneDefinedPointDefinitions, getSceneDefinedPointsAsArray } from '../sensorUtils';
import { circleIntersectsPolygon } from '../../../utils/geometry';

const name = 'polygons';

class PolygonsSensor extends Sensor {
  constructor(robot, scene, { regions = [] } = {}) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [
      CoreSensors.position
    ];
    this.value = [];

    this.regions = regions;

    this.sceneDefinedVerticesDefinitions = {};
    for (const region of this.regions) {
      this.sceneDefinedVerticesDefinitions[region.name] = getSceneDefinedPointDefinitions(region.vertices);
    }
  }

  sample() {
    for (const region of this.regions) {
      this.value[region.name] = this.sampleRegion(region);
    }
  }

  sampleRegion(region) {
    const sceneDefinedVertexArray = getSceneDefinedPointsAsArray(
      this.sceneDefinedVerticesDefinitions[region.name],
      this.robot.sensors
    );

    const reading = {};

    // Test against walls.
    if (region.sensedTypes.includes('walls')) {
      reading.walls = 0;
      console.alert('Error: PolygonsSensor not yet equipped to detect walls');
    }

    // Test against other robots.
    if (region.sensedTypes.includes('robots')) {
      reading.robots = this.scene?.robots?.filter(
        (robot) => (
          (robot.id !== this.robot.id)
          && circleIntersectsPolygon(robot.body.position, robot.radius, sceneDefinedVertexArray)
        )
      ).length;
    }

    // Test against pucks.
    if (region.sensedTypes.includes('pucks')) {
      reading.pucks = this.scene?.pucks?.filter(
        (puck) => !puck.held && circleIntersectsPolygon(puck.position, puck.radius, sceneDefinedVertexArray)
      ).length;
    }

    return { reading, vertices: sceneDefinedVertexArray };
  }
}

export default {
  name,
  Sensor: PolygonsSensor
};
