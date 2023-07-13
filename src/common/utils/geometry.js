/* eslint-disable no-param-reassign */
/*
 ************************************************
 *************** Helper Functions ***************
 ************************************************
 */

export function radToDeg(radians) {
  return (radians * 180) / Math.PI;
}

export function normalizeAngle(angle) {
  return angle % (2 * Math.PI);
}

export function normalizeAnglePlusMinusPi(a) {
  // BAD: These loops should be replaced.
  while (a > Math.PI) {
    a -= 2 * Math.PI;
  }
  while (a <= -Math.PI) {
    a += 2 * Math.PI;
  }
  return a;
}

export function getAngularDifference(angleA, angleB) {
  angleA = normalizeAnglePlusMinusPi(angleA);
  angleB = normalizeAnglePlusMinusPi(angleB);
  let error = Math.abs(angleA - angleB);
  if (error > Math.PI) {
    error -= Math.PI * 2;
    error = Math.abs(error);
  }
  return error;
}

export function getSmallestSignedAngularDifference(a, b) {
  /* Return angle between the two given angles with the smallest absolute
       value.  Meanwhile, the value returned will have a sign. */
  // From: https://stackoverflow.com/questions/1878907/the-smallest-difference-between-2-angles
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

/*
* Calculates the angle ABC (in radians)
*
* A first point, ex: {x: 0, y: 0}
* C second point
* B center point
*/
export function angleBetweenThreePointsRad(A, B, C) {
  const AB = Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2);
  const BC = Math.sqrt((B.x - C.x) ** 2 + (B.y - C.y) ** 2);
  const AC = Math.sqrt((C.x - A.x) ** 2 + (C.y - A.y) ** 2);
  const val = (BC * BC + AB * AB - AC * AC) / (2 * BC * AB);

  return Math.acos(Math.min(1, Math.max(-1, val)));
}

export function angleBetweenThreePointsDeg(A, B, C) {
  const angleRad = angleBetweenThreePointsRad(A, B, C);
  return radToDeg(angleRad);
}

export function getPointFromDistanceAndAngle(length, angle) {
  return {
    x: length * Math.cos(angle),
    y: length * Math.sin(angle)
  };
}

export function getAbsolutePointFromRelativePoint(center, point) {
  return {
    x: point.x + center.x,
    y: point.y + center.y
  };
}

export function getPolarCoordsFromCartesian(x, y) {
  const distance = Math.sqrt(x ** 2 + y ** 2);
  const angle = Math.atan2(y, x);
  return { distance, angle };
}

export function getAbsolutePointFromDistanceAndAngle(center, length, angle) {
  return getAbsolutePointFromRelativePoint(center, getPointFromDistanceAndAngle(length, angle));
}

export function closePolygon(poly) {
  if (!poly || poly.length < 2) {
    return poly;
  }

  const firstPoint = poly[0];
  const lastPoint = poly[poly.length - 1];

  if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
    poly.push(firstPoint);
  }

  return poly;
}

/** * Ruler Function */
export function pointOnLineSegmentPerRatio(startPoint, endPoint, ratio) {
  return {
    x: (1 - ratio) * startPoint.x + ratio * endPoint.x,
    y: (1 - ratio) * startPoint.y + ratio * endPoint.y
  };
}

export function nxtCircIndx(i, length) {
  return (i + 1) % length;
}

export function dotProduct(vec1, vec2) {
  return vec1.x * vec2.x + vec1.y * vec2.y;
}

export function pointIsOnRightSideOfVector(x, y, x1, y1, x2, y2) {
  const vec1 = { x: x - x1, y: -y + y1 };
  const rot90Vec1 = { x: -1 * vec1.y, y: vec1.x };
  const vec2 = { x: x2 - x1, y: -y2 + y1 };

  const dot2 = dotProduct(rot90Vec1, vec2);
  return dot2 > 0;
}

export function allPointsAreOnSameSideOfVector(pointsArray, vecStart, vecEnd) {
  let prevSide = null;

  for (let i = 0; i < pointsArray.length; i += 1) {
    const p = pointsArray[i];
    const curSide = pointIsOnRightSideOfVector(
      p.x,
      p.y,
      vecStart.x,
      vecStart.y,
      vecEnd.x,
      vecEnd.y
    );

    if (prevSide == null) {
      prevSide = curSide;
    } else if (curSide !== prevSide) {
      return false;
    }
  }

  return true;
}

export function closestPointInLineToPoint(x, y, x1, y1, x2, y2) {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  // in case of 0 length line
  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  const xx = x1 + param * C;
  const yy = y1 + param * D;

  return { x: xx, y: yy };
}

export function closestPointInLineSegToPoint(x, y, x1, y1, x2, y2) {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  // in case of 0 length line
  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx;
  let yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  return { x: xx, y: yy };
}

export function getDistance(pos1, pos2) {
  if (
    pos1 == null || pos2 == null
        || pos1.x == null || pos1.y == null
        || pos2.x == null || pos2.y == null
  ) {
    return null;
  }

  const ret = Math.sqrt(
    (pos1.x - pos2.x) * (pos1.x - pos2.x) + (pos1.y - pos2.y) * (pos1.y - pos2.y)
  );
  return ret;
}

export function closestPointInPolygonToPoint(origPolygon, origPoint) {
  // if point is array transform it to object
  const point = Array.isArray(origPoint) ? { x: origPoint[0], y: origPoint[1] } : origPoint;
  // if polygon points are array transform it to object
  const polygon = origPolygon.map((p) => (Array.isArray(p) ? { x: p[0], y: p[1] } : p));
  let closestPoint = null;
  let minDist = null;

  for (let index = 0; index < polygon.length; index += 1) {
    const v1 = polygon[index];
    const v2 = polygon[nxtCircIndx(index, polygon.length)];
    const closestPointInLineSeg = closestPointInLineSegToPoint(
      point.x,
      point.y,
      v1.x,
      v1.y,
      v2.x,
      v2.y
    );

    const distGoalToLineSeg = getDistance(point, closestPointInLineSeg);

    if (closestPoint == null || distGoalToLineSeg < minDist) {
      closestPoint = { x: closestPointInLineSeg.x, y: closestPointInLineSeg.y };
      minDist = distGoalToLineSeg;
    }
  }

  return closestPoint;
}

export function distanceBetweenPointAndLine(point, point1LineSeg, point2LineSeg) {
  const ret = getDistance(
    point,
    closestPointInLineToPoint(
      point.x,
      point.y,
      point1LineSeg.x,
      point1LineSeg.y,
      point2LineSeg.x,
      point2LineSeg.y
    )
  );
  return ret;
}

export function distanceBetweenPointAndLineSeg(point, point1LineSeg, point2LineSeg) {
  const ret = getDistance(
    point,
    closestPointInLineSegToPoint(
      point.x,
      point.y,
      point1LineSeg.x,
      point1LineSeg.y,
      point2LineSeg.x,
      point2LineSeg.y
    )
  );
  return ret;
}

export function minDistanceToLine(pointsArray, vecStart, vecEnd) {
  let minDist = null;

  pointsArray.forEach((p) => {
    const curDist = distanceBetweenPointAndLine(
      p,
      vecStart,
      vecEnd
    );

    if (minDist == null) {
      minDist = curDist;
    } else if (curDist < minDist) {
      minDist = curDist;
    }
  });

  return minDist;
}

export function midPointOfLineSeg(x1, y1, x2, y2) {
  return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
}

export function slopeOfLineSeg(x1, y1, x2, y2) {
  if ((x2 - x1) === 0) {
    return 99999999999;
  }
  return (y2 - y1) / (x2 - x1);
}

export function slopeOfPerpendicularBisectorOfLineSeg(x1, y1, x2, y2) {
  return -1 / slopeOfLineSeg(x1, y1, x2, y2);
}

export function directionOfPerpendicularBisector(x1, y1, x2, y2, scale) {
  const length = getDistance({ x: x1, y: y1 }, { x: x2, y: y2 });
  return { x: (scale * (y1 - y2)) / length, y: (scale * (x2 - x1)) / length };
}

export function translatePointInDirection(x1, y1, xVec, yVec) {
  return { x: x1 + xVec, y: y1 + yVec };
}

export function shiftPointOfLineSegInDirOfPerpendicularBisector(x, y, x1, y1, x2, y2, scale) {
  const dir = directionOfPerpendicularBisector(x1, y1, x2, y2, scale);
  const p1 = translatePointInDirection(x, y, dir.x, dir.y);
  return p1;
}

export function shiftLineSegInDirOfPerpendicularBisector(x1, y1, x2, y2, scale) {
  const dir = directionOfPerpendicularBisector(x1, y1, x2, y2, scale);
  const p1 = translatePointInDirection(x1, y1, dir.x, dir.y);
  const p2 = translatePointInDirection(x2, y2, dir.x, dir.y);
  return [p1, p2];
}

export function getLineLineIntersectionPoint(
  line1StartX,
  line1StartY,
  line1EndX,
  line1EndY,
  line2StartX,
  line2StartY,
  line2EndX,
  line2EndY
) {
  // if the lines intersect,
  // the result contains the x and y of the intersection (treating the lines as infinite)
  // and booleans for whether line segment 1 or line segment 2 contain the point
  let a;
  let b;
  const result = {
    x: null,
    y: null,
    onLine1: false,
    onLine2: false
  };

  const denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX))
        - ((line2EndX - line2StartX) * (line1EndY - line1StartY));

  if (denominator === 0) {
    return result;
  }

  a = line1StartY - line2StartY;
  b = line1StartX - line2StartX;

  const numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
  const numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);

  a = numerator1 / denominator;
  b = numerator2 / denominator;

  // if we cast these lines infinitely in both directions, they intersect here:
  result.x = line1StartX + (a * (line1EndX - line1StartX));
  result.y = line1StartY + (a * (line1EndY - line1StartY));
  /*
        // it is worth noting that this should be the same as:
        x = line2StartX + (b * (line2EndX - line2StartX));
        y = line2StartX + (b * (line2EndY - line2StartY));
        */
  // if line1 is a segment and line2 is infinite, they intersect if:
  if (a > 0 && a < 1) {
    result.onLine1 = true;
  }
  // if line2 is a segment and line1 is infinite, they intersect if:
  if (b > 0 && b < 1) {
    result.onLine2 = true;
  }
  // if line1 and line2 are segments, they intersect if both of the above are true
  return result;
}

// distToSegment gives the distance from point p to a line segment defined by end-points v and w:
// https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
function sqr(x) { return x * x; }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y); }
function distToSegmentSquared(p, v, w) {
  const l2 = dist2(v, w);
  if (l2 === 0) return dist2(p, v);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2(p, { x: v.x + t * (w.x - v.x),
    y: v.y + t * (w.y - v.y) });
}
function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }

export function pointIsInsidePolygon(point, polygon) {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

  const { x } = point; const { y } = point;

  let inside = false;
  try {
    // eslint-disable-next-line no-plusplus
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0]; const yi = polygon[i][1];
      const xj = polygon[j][0]; const yj = polygon[j][1];

      const intersect = ((yi > y) !== (yj > y))
                    && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  } catch (err) {
    return false;
  }
}

export function circleIntersectsPolygon(point, radius, polygon) {
  if (pointIsInsidePolygon(point, polygon)) { return true; }

  // Check each line segment of the polygon for intersection with this circle.
  // eslint-disable-next-line no-plusplus
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const v = { x: polygon[i][0], y: polygon[i][1] };
    const w = { x: polygon[j][0], y: polygon[j][1] };
    if (distToSegment(point, v, w) < radius) { return true; }
  }

  return false;
}

export function polygonArea(polygon) {
  if (polygon === undefined || polygon.length < 3) {
    return 0;
  }

  let area = 0; // Accumulates area in the loop
  let j = polygon.length - 1; // The last vertex is the 'previous' one to the first

  for (let i = 0; i < polygon.length; i += 1) {
    area += (polygon[j][0] + polygon[i][0]) * (polygon[j][1] - polygon[i][1]);
    j = i; // j is previous vertex to i
  }
  return Math.abs(area / 2);
}

export function circleArea(radius) {
  return (radius * radius * Math.PI);
}

export function xyPoint(p) {
  if (p && Array.isArray(p) && p.length === 2) {
    return { x: p[0], y: p[1] };
  }
  if (p && p.x !== undefined && p.y !== undefined) {
    return p;
  }
  return null;
}

export function getLineEquationParams(p1, p2) {
  const x1 = p1.x;
  const y1 = p1.y;
  const x2 = p2.x;
  const y2 = p2.y;

  const a = y1 - y2;
  const b = x2 - x1;
  const c = (x1 - x2) * y1 + (y2 - y1) * x1;

  return [a, b, c];
}

// Static obstacles

/**
 * Finds the intersection between a circle's border
 * and the line from the circle's origin to the otherLineEndPoint.
 * @param  {Vector} center            - center of the circle and start of the line
 * @param  {number} radius            - radius of the circle
 * @param  {Vector} otherLineEndPoint - end of the line
 * @return {Vector}                   - point of the intersection
 */
export function getLineCircleIntersectionPoint(center, radius, otherLineEndPoint) {
  let v = { x: otherLineEndPoint.x - center.x, y: otherLineEndPoint.y - center.y };
  const lineLength = getDistance(v, { x: 0, y: 0 });
  if (lineLength === 0) {
    throw new Error('Cannot get intersection point between line and circle, end point is same as center!');
  }
  v = { x: v.x / lineLength, y: v.y / lineLength };
  return { x: center.x + v.x * radius, y: center.y + v.y * radius };
}
