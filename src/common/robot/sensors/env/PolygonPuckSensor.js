/* eslint-disable no-console */
import Sensor from '../sensor';
import { sensorSamplingTypes, AvailableSensors } from '../sensorManager';
import { getSceneDefinedPointDefinitions, getSceneDefinedPoints } from '../sensorUtils';

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
        this.sceneDefinedVertices = getSceneDefinedPoints(this.sceneDefinedVerticesDefinitions, this.robot.sensors);

        const result = this.scene?.pucks?.filter(
                (puck) => !puck.held && pointIsInsidePolygon(puck.position, this.sceneDefinedVertices) 
        ).length;

        this.value = {
            reading: result,
            vertices: this.sceneDefinedVertices
        };
    }
}

export default {
    name,
    Sensor: PolygonPuckSensor
};
