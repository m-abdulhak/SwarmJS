/* eslint-disable no-console */
import Sensor from '../sensor';
import { sensorSamplingTypes, AvailableSensors } from '../sensorManager';
import { getSceneDefinedPointDefinitions, getSceneDefinedPointsAsArray } from '../sensorUtils';
import { circleIntersectsPolygon } from '../../../utils/geometry';

const name = 'polygonPucks';

class PolygonPuckSensor extends Sensor {
    constructor(robot, scene, { vertices = [] } = {}) {
        super(robot, scene, name, sensorSamplingTypes.onUpdate);
        this.dependencies = [
            AvailableSensors.position,
        ];
        this.value = [];

        this.sceneDefinedVerticesDefinitions = getSceneDefinedPointDefinitions(vertices);
    }

    sample() {
        this.sceneDefinedVertexArray = getSceneDefinedPointsAsArray(this.sceneDefinedVerticesDefinitions, this.robot.sensors);
        console.log(this.sceneDefinedVertices);

        const result = this.scene?.pucks?.filter(
                (puck) => !puck.held && circleIntersectsPolygon(puck.position, puck.radius, this.sceneDefinedVertexArray) 
        ).length;

        this.value = {
            reading: result,
            vertices: this.sceneDefinedVertexArray
        };
    }
}

export default {
    name,
    Sensor: PolygonPuckSensor
};
