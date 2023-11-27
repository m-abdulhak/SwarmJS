/* eslint-disable no-param-reassign */
/* eslint-disable default-param-last */
/* eslint-disable no-eval */

// eslint-disable-next-line no-unused-vars
export function init(CONST, VAR, FUNC, robot, params) {
  // PARAMETERS:
  CONST.maxAngularSpeed = 0.015;
  CONST.maxForwardSpeed = 0.2;
}

export function controller(robot, params, onLoop, onInit) {
  // Object that contains constants
  const CONST = {};

  // Object that contains variables
  const VAR = {};

  // Object that contains functions
  const FUNC = {};

  let initFunc = () => {};
  if (onInit) {
    const userDefinedInitFunc = eval(onInit);

    if (userDefinedInitFunc && typeof userDefinedInitFunc === 'function') {
      initFunc = userDefinedInitFunc;
    }
  }

  initFunc(CONST, VAR, FUNC, robot, params);

  Object.freeze(CONST);

  if (onLoop) {
    const func = eval(onLoop);

    if (func && typeof func === 'function') {
      return func;
    }
  }

  return (sensors) => {
    const pucksDetected = sensors.polygons.left.reading.pucks;

    const forwardSpeed = 1;
    const angularSpeed = pucksDetected > 0 ? -1 : 1;

    return {
      linearVel: forwardSpeed * CONST.maxForwardSpeed * robot.velocityScale,
      angularVel: angularSpeed * CONST.maxAngularSpeed * robot.velocityScale,
      type: robot.SPEED_TYPES.RELATIVE
    };
  };
}
