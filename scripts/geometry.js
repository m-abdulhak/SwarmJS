/* eslint-disable no-unused-vars */
/*
 ************************************************
 *************** Helper Functions ***************
 ************************************************
 */

/** * Ruler Function */
function pointOnLineSegmentPerRatio(startPoint, endPoint, ratio) {
  return {
    x: (1 - ratio) * startPoint.x + ratio * endPoint.x,
    y: (1 - ratio) * startPoint.y + ratio * endPoint.y,
  };
}

function nxtCircIndx(i, length) {
  return (i + 1) % length;
}

function minDistanceToLine(pointsArray, vecStart, vecEnd) {
  let minDist = null;

  for (const p of pointsArray) {
    const curDist = distanceBetweenPointAndLine(p,
      vecStart,
      vecEnd);

    if (minDist == null) {
      minDist = curDist;
    } else if (curDist < minDist) {
      minDist = curDist;
    }
  }

  return minDist;
}

function allPointsAreOnSameSideOfVector(pointsArray, vecStart, vecEnd) {
  let prevSide = null;

  for (const p of pointsArray) {
    const curSide = pointIsOnRightSideOfVector(p.x, p.y,
      vecStart.x, vecStart.y,
      vecEnd.x, vecEnd.y);

    if (prevSide == null) {
      prevSide = pointIsOnRightSideOfVector(p.x, p.y,
        vecStart.x, vecStart.y,
        vecEnd.x, vecEnd.y);
    } else if (curSide != prevSide) {
      return false;
    }
  }

  return true;
}

function pointIsOnRightSideOfVector(x, y, x1, y1, x2, y2) {
  const vec1 = { x: x - x1, y: -y + y1 };
  const rot90Vec1 = { x: -1 * vec1.y, y: vec1.x };
  const vec2 = { x: x2 - x1, y: -y2 + y1 };

  const dot2 = dotProduct(rot90Vec1, vec2);
  return dot2 > 0;
}

function dotProduct(vec1, vec2) {
  return vec1.x * vec2.x + vec1.y * vec2.y;
}

function closestPointInLineToPoint(x, y, x1, y1, x2, y2) {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;
  if (len_sq != 0) // in case of 0 length line
  { param = dot / len_sq; }

  let xx; let
    yy;

  xx = x1 + param * C;
  yy = y1 + param * D;

  return { x: xx, y: yy };
}

function closestPointInLineSegToPoint(x, y, x1, y1, x2, y2) {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;
  if (len_sq != 0) // in case of 0 length line
  { param = dot / len_sq; }

  let xx; let
    yy;

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

function distanceBetween2Points(pos1, pos2) {
  const ret = Math.sqrt((pos1.x - pos2.x) * (pos1.x - pos2.x) + (pos1.y - pos2.y) * (pos1.y - pos2.y));
  return ret;
}

function distanceBetweenPointAndLine(point, point1LineSeg, point2LineSeg) {
  const ret = distanceBetween2Points(point, closestPointInLineToPoint(point.x, point.y, point1LineSeg.x, point1LineSeg.y, point2LineSeg.x, point2LineSeg.y));
  return ret;
}

function distanceBetweenPointAndLineSeg(point, point1LineSeg, point2LineSeg) {
  const ret = distanceBetween2Points(point, closestPointInLineSegToPoint(point.x, point.y, point1LineSeg.x, point1LineSeg.y, point2LineSeg.x, point2LineSeg.y));
  return ret;
}

function midPointOfLineSeg(x1, y1, x2, y2) {
  return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
}

function slopeOfLineSeg(x1, y1, x2, y2) {
  if ((x2 - x1) == 0) {
    return 99999999999;
  }
  return (y2 - y1) / (x2 - x1);
}

function slopeOfPerpendicularBisectorOfLineSeg(x1, y1, x2, y2) {
  return -1 / slopeOfLineSeg(x1, y1, x2, y2);
}

function directionOfPerpendicularBisector(x1, y1, x2, y2, scale) {
  const length = distanceBetween2Points({ x: x1, y: y1 }, { x: x2, y: y2 });
  return { x: scale * (y1 - y2) / length, y: scale * (x2 - x1) / length };
}

function translatePointInDirection(x1, y1, xVec, yVec) {
  return { x: x1 + xVec, y: y1 + yVec };
}

function shiftPointOfLineSegInDirOfPerpendicularBisector(x, y, x1, y1, x2, y2, scale) {
  const dir = directionOfPerpendicularBisector(x1, y1, x2, y2, scale);
  const p1 = translatePointInDirection(x, y, dir.x, dir.y);
  return p1;
}

function shiftLineSegInDirOfPerpendicularBisector(x1, y1, x2, y2, scale) {
  const dir = directionOfPerpendicularBisector(x1, y1, x2, y2, scale);
  const p1 = translatePointInDirection(x1, y1, dir.x, dir.y);
  const p2 = translatePointInDirection(x2, y2, dir.x, dir.y);
  return [p1, p2];
}

function getIntersectionPoint(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
  // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
  let denominator; let a; let b; let numerator1; let numerator2; const result = {
    x: null,
    y: null,
    onLine1: false,
    onLine2: false,
  };
  denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
  if (denominator == 0) {
    return result;
  }
  a = line1StartY - line2StartY;
  b = line1StartX - line2StartX;
  numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
  numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
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

function pointIsInsidePolygon(point, polygon) {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

  const { x } = point; const { y } = point;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0]; const yi = polygon[i][1];
    const xj = polygon[j][0]; const yj = polygon[j][1];

    const intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

function polygonArea(polygon) {
  if (polygon == undefined || polygon.length < 3) {
    return 0;
  }

  area = 0; // Accumulates area in the loop
  j = polygon.length - 1; // The last vertex is the 'previous' one to the first

  for (i = 0; i < polygon.length; i++) {
    area += (polygon[j][0] + polygon[i][0]) * (polygon[j][1] - polygon[i][1]);
    j = i; // j is previous vertex to i
  }
  return Math.abs(area / 2);
}

function circleArea(radius) {
  return (radius * radius * Math.PI);
}

function xyPoint(p) {
  return { x: p[0], y: p[1] };
}
