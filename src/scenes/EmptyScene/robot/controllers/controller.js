/* eslint-disable no-param-reassign */
/* eslint-disable default-param-last */
/* eslint-disable no-eval */

// eslint-disable-next-line no-unused-vars
export function init(CONST, VAR, FUNC, robot, params) {

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

  return (sensors, actuators) => {
    return {
      linearVel: 0,
      angularVel: 0,
      type: robot.SPEED_TYPES.RELATIVE
    };
  };
}
