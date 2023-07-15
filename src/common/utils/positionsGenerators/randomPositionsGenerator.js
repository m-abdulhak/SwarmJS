// Module to generate random initial positions for robots and pucks

import { getDistance } from '../geometry';

export default function getRandCollFreePosGenerator(
  posNum,
  radius,
  envWidth,
  envHeight,
  staticObjects = [],
  getCurPosAndRadii = []
) {
  const generatePos = (r) => {
    const xCount = envWidth / r;
    const yCount = envHeight / r;
    const minX = r * 2;
    const maxX = envWidth - r * 2;
    const minY = r * 2;
    const maxY = envHeight - r * 2;

    const newX = Math.max(minX, Math.min(maxX, Math.floor(Math.random() * xCount) * r));
    const newY = Math.max(minY, Math.min(maxY, Math.floor(Math.random() * yCount) * r));
    const newPos = { x: newX, y: newY };

    const doesNotCollideWithOtherPositions = getCurPosAndRadii
      .findIndex(([p, pr]) => getDistance(p, newPos) < (r + pr) * 1.1) === -1;

    const doesNotCollideWithObstacles = staticObjects.reduce((acc, cur) => !cur.containsPoint(newPos)
        && cur.getDistanceToBorder(newPos) > r && acc, true);

    if (doesNotCollideWithOtherPositions && doesNotCollideWithObstacles) {
      return newPos;
    }

    return null;
  };

  const getPos = (r) => {
    for (let tries = 0; tries < 100000; tries += 1) {
      const newPos = generatePos(r);

      if (newPos) {
        return newPos;
      }
    }

    throw new Error('No collision-free positions available!');
  };

  return getPos;
}
