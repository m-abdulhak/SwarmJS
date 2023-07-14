/*
 ************************************************
 *************** Helper Functions ***************
 ************************************************
 */
import { getPolarCoordsFromCartesian, getAbsolutePointFromDistanceAndAngle } from '../../utils/geometry';

export function getSceneDefinedPointDefinitions(points) {
  return points.reduce((acc, pDef) => {
    if (!pDef.name || !pDef.coords || !pDef.type || (pDef.type !== 'Cartesian' && pDef.type !== 'Polar')) {
      // eslint-disable-next-line no-console
      console.error('Unrecognized point definition:', pDef);
      return acc;
    }
    if (pDef.type === 'Cartesian') {
      const coords = getPolarCoordsFromCartesian(pDef.coords.x, pDef.coords.y);

      // Keep compatibility with other angles using positive angle direction as clockwise
      coords.angle *= -1;

      acc[pDef.name] = coords;
      return acc;
    }
    if (pDef.type === 'Polar') {
      acc[pDef.name] = pDef.coords;
      return acc;
    }
    return acc;
  }, {});
}

export function getSceneDefinedPoints(pointDefinitions, sensors) {
  return Object.entries(pointDefinitions)
    .reduce((acc, [pointDefKey, pointDef]) => {
      const angle = sensors.orientation + pointDef.angle;
      const distance = pointDef.distance;
      acc[pointDefKey] = getAbsolutePointFromDistanceAndAngle(
        sensors.position,
        distance,
        angle
      );
      return acc;
    }, {});
}

export function getSceneDefinedPointsAsArray(pointDefinitions, sensors) {
  const pointsObject = getSceneDefinedPoints(pointDefinitions, sensors);
  const outputArray = [];
  for (const point of Object.values(pointsObject)) {
    outputArray.push([point.x, point.y]);
  }
  return outputArray;
}
