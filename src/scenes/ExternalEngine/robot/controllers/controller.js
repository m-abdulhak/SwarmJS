/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */
/* eslint-disable no-eval */

import { CoreControllers } from '@common';

export function init(CONSTANTS, STATE, robot) {
  const goal = {
    x: Math.random() * (robot?.scene?.width || 1),
    y: Math.random() * (robot?.scene?.height || 1)
  };

  if (robot) {
    robot.goal = goal;
  }
}

export function controller(
  robot,
  params = {},
  onLoop = null,
  onInit = null
) {
  return CoreControllers.velocity.diffVelocityController(robot, params, onLoop, onInit || init);
}
