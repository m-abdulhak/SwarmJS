/* eslint-disable no-param-reassign */
/* eslint-disable default-param-last */
/* eslint-disable no-eval */

export function init(CONST, VAR, FUNC, robot, params) {
  // PARAMETERS:
  CONST.maxAngularSpeed = 0.1;
  CONST.maxForwardSpeed = 5;
  CONST.loopsToKeepSameSpeeds = 1000;

  FUNC.getNewAngularSpeed = () => Math.random() * CONST.maxAngularSpeed * 2 - CONST.maxAngularSpeed;
  FUNC.getNewForwardSpeed = () => Math.random() * CONST.maxForwardSpeed * 2 - CONST.maxForwardSpeed;

  VAR.angularSpeed = FUNC.getNewAngularSpeed();
  VAR.forwardSpeed = FUNC.getNewForwardSpeed();
  VAR.loopsSinceLastSpeedChange = 0;
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
    if (VAR.loopsSinceLastSpeedChange >= CONST.loopsToKeepSameSpeeds) {
      VAR.angularSpeed = FUNC.getNewAngularSpeed();
      VAR.forwardSpeed = FUNC.getNewForwardSpeed();
      VAR.loopsSinceLastSpeedChange = 0;
    } else {
      VAR.loopsSinceLastSpeedChange += 1;
    }

    return {
      linearVel: VAR.forwardSpeed,
      angularVel: VAR.angularSpeed,
      type: robot.SPEED_TYPES.RELATIVE
    };
  };
}
