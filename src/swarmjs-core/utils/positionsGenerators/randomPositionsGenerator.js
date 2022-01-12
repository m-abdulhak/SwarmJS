// Module to generate random initial positions for robots and pucks
// TODO: replace with a js generator

import { getDistance } from '../geometry';

const positions = [];

const getPos = () => {
  if (positions.length === 0) {
    throw new Error('No positions available!');
  }
  return positions.pop();
};

export default function getRandCollFreePosGenerator(
  numOfPos, radius, envWidth, envHeight, staticObjects
) {
  const resolution = (radius * 2.1);
  const xCount = envWidth / resolution;
  const yCount = envHeight / resolution;
  const positionsCount = parseInt(numOfPos, 10);

  if (xCount * yCount < positionsCount * 4) {
    throw new Error('Invalid inputs, number and size of robots and pucks are too high for this environment size!');
  }

  let i = 0;
  while (positions.length < positionsCount * 3 && i < positionsCount * 100) {
    const newX = Math.max(
      radius * 2,
      Math.min(envWidth - radius * 2, Math.floor(Math.random() * xCount) * resolution)
    );
    const newY = Math.max(
      radius * 2,
      Math.min(envHeight - radius * 2, Math.floor(Math.random() * yCount) * resolution)
    );
    const newPos = { x: newX, y: newY };
    const doesNotCollideWithRobots = positions
      .findIndex((x) => getDistance(x, newPos) < radius * 2.2) === -1;
    const doesNotCollideWithObstacles = staticObjects
      .reduce((acc, cur) => !cur.containsPoint(newPos)
        && cur.getDistanceToBorder(newPos) > radius && acc, true);

    if (doesNotCollideWithRobots && doesNotCollideWithObstacles) {
      positions.push(newPos);
    }
    i += 1;
  }

  if (positions.length < positionsCount * 2) {
    throw new Error('Invalid inputs, number and size of robots are too high for this environment!');
  }

  return getPos;
}
