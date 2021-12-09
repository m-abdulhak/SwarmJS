// This sensor uses the voronoi diagram calculated by the scene to determine the cell
// that the robot is in to avoid recalculating multiple Voronoi diagrams by each robot.
// If local measurements are needed, such as if sensor errors are simulated in
// neighbors measurements; this sensor should be re-implemented to regenerate its own
// Voronoi diagram using the sensed positions of the neighbors.

import splitPolygon from 'split-polygon';

import { sensorSamplingTypes } from './sensorManager';
import {
  shiftPointOfLineSegInDirOfPerpendicularBisector,
  getLineEquationParams,
  pointIsInsidePolygon,
  closePolygon
} from '../../geometry';

const name = 'voronoiCell';

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

const VoronoiCellSensor = (robot, scene) => {
  const type = sensorSamplingTypes.onUpdate;
  const dependencies = [];

  // private
  let value = [];

  const sample = () => {
    const originalVC = scene.voronoi.cellPolygon(robot.id);
    const pos = robot.sense('position');
    // TODO: move getClosestPointToNearbyObstacles to a sensor and use through a dependency
    const closestPoint = robot.getClosestPointToNearbyObstacles();
    value = trimVCwithStaticObstacles(pos, originalVC, closestPoint);
  };

  const read = () => value;

  return {
    name,
    type,
    dependencies,
    sample,
    read
  };
};

export default {
  name,
  Sensor: VoronoiCellSensor
};
