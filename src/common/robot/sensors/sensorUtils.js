/*
 ************************************************
 *************** Helper Functions ***************
 ************************************************
 */
import { getPolarCoordsFromCartesian, getAbsolutePointFromDistanceAndAngle } from '../../utils/geometry';

export function getSceneDefinedPointDefinitions(points) {
    return points.reduce((acc, pDef) => {
        if (!pDef.name || !pDef.coords || !pDef.type || (pDef.type !== 'Cartesian' && pDef.type !== 'Polar')) {
            console.error('Unrecognized point definitinon:', pDef);
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

    var pointsObject = getSceneDefinedPoints(pointDefinitions, sensors);
    var outputArray = [];
    for (const [key, point] of Object.entries(pointsObject)) {
        // We will ignore the key (i.e. the name) and just add each point
        // as a row.
        outputArray.push([point.x, point.y])
    }
    return outputArray;
}

export function sampleFieldAtPoint(context, p) {
  if (!context?.getImageData || typeof context.getImageData !== 'function') {
    return null;
  }

  if (p.x < 0 || p.y < 0 || p.x >= context.canvas.width || p.y >= context.canvas.width) {
    return [0, 0, 0, 0];
  }

  const imageVal = context.getImageData(p.x, p.y, 1, 1);
  return imageVal.data;
};
