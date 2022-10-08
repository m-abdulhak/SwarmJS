/* eslint-disable import/prefer-default-export */
import { Bodies } from 'matter-js';

export const getEnvBoundaryObjects = (envWidth, envHeight) => [
  // walls
  Bodies.rectangle(
    envWidth / 2,
    -10,
    envWidth,
    20,
    { isStatic: true }
  ),
  Bodies.rectangle(
    envWidth / 2,
    envHeight + 10,
    envWidth,
    20,
    { isStatic: true }
  ),
  Bodies.rectangle(
    -10,
    envHeight / 2,
    20,
    envHeight,
    { isStatic: true }
  ),
  Bodies.rectangle(
    envWidth + 10,
    envHeight / 2,
    20,
    envHeight,
    { isStatic: true }
  )
];
