/* eslint-disable no-param-reassign */
/* eslint-disable default-param-last */
/* eslint-disable no-eval */

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
    const leftPucks = sensors.polygons.left.reading.pucks;
    const angularSpeed = leftPucks > 0 ? -CONST.maxAngularSpeed : CONST.maxAngularSpeed;

    return {
      linearVel: CONST.maxForwardSpeed * robot.velocityScale,
      angularVel: angularSpeed * robot.velocityScale,
      type: robot.SPEED_TYPES.RELATIVE
    };
  };
}
