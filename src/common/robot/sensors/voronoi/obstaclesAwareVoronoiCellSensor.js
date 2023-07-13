/* eslint-disable import/no-cycle */
// This sensor uses the voronoi diagram calculated by the scene to determine the cell
// that the robot is in to avoid recalculating multiple Voronoi diagrams by each robot.
// If local measurements are needed, such as if sensor errors are simulated in
// neighbors measurements; this sensor should be re-implemented to regenerate its own
// Voronoi diagram using the sensed positions of the neighbors.

import splitPolygon from 'split-polygon';

import Sensor from '../sensor';
import { CoreSensors, ExtraSensors, sensorSamplingTypes } from '../sensorManager';
import {
  shiftPointOfLineSegInDirOfPerpendicularBisector,
  getLineEquationParams,
  pointIsInsidePolygon,
  closePolygon
} from '../../../utils/geometry';

const name = 'obstaclesAwareVoronoiCell';

const trimVCwithStaticObstacles = (pos, VC, closestPoint) => {
  if (closestPoint == null) {
    return VC;
  }

  const secondLinePoint = shiftPointOfLineSegInDirOfPerpendicularBisector(
    closestPoint.x,
    closestPoint.y,
    closestPoint.x,
    closestPoint.y,
    pos.x,
    pos.y,
    1
  );

  const splittingLineParams = getLineEquationParams(closestPoint, secondLinePoint);

  const splitPolygonRes = VC && VC.length > 2
    ? splitPolygon(VC, splittingLineParams)
    : { positive: VC, negative: [] };
  const splitPolygonParts = [splitPolygonRes.positive, splitPolygonRes.negative];
  splitPolygonParts.map(
    (poly) => closePolygon(poly)
  );

  if (pointIsInsidePolygon(pos, splitPolygonParts[0])) {
    return splitPolygonParts[0];
  }
  return splitPolygonParts[1];
};

class ObstaclesAwareVoronoiCellSensor extends Sensor {
  constructor(robot, scene) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [
      CoreSensors.position,
      ExtraSensors.closestObstaclePoint
    ];
    this.value = [];
  }

  sample() {
    const originalVC = this.scene?.voronoi?.cellPolygon(this.robot.id);

    if (originalVC == null) {
      this.value = [];
      return;
    }

    const pos = this.robot.sensors?.position;
    const closestPoint = this.robot?.sensors?.closestObstaclePoint;
    this.value = pos && closestPoint
      ? trimVCwithStaticObstacles(pos, originalVC, closestPoint)
      : originalVC;
  }
}

export default {
  name,
  Sensor: ObstaclesAwareVoronoiCellSensor
};
