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

        this.sceneDefinedVerticesDefinitions = {
            left: getSceneDefinedPointDefinitions(vertices.left),
            right: getSceneDefinedPointDefinitions(vertices.right)
        }
    }

    sample() {
        this.sceneDefinedVertexArray = { 
            left: getSceneDefinedPointsAsArray(this.sceneDefinedVerticesDefinitions.left, this.robot.sensors),
            right: getSceneDefinedPointsAsArray(this.sceneDefinedVerticesDefinitions.right, this.robot.sensors)
        };

        const leftCount = this.scene?.pucks?.filter(
            (puck) => !puck.held && circleIntersectsPolygon(puck.position, puck.radius, this.sceneDefinedVertexArray.left)
        ).length;

        const rightCount = this.scene?.pucks?.filter(
            (puck) => !puck.held && circleIntersectsPolygon(puck.position, puck.radius, this.sceneDefinedVertexArray.right)
        ).length;

        this.value = {
            left: {
                reading: leftCount,
                vertices: this.sceneDefinedVertexArray.left,
            },
            right: {
                reading: rightCount,
                vertices: this.sceneDefinedVertexArray.right,
            }
        };
    }
}

export default {
    name,
    Sensor: PolygonPuckSensor
};
