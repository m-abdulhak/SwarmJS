/* eslint-disable no-param-reassign */
/* eslint-disable default-param-last */
/* eslint-disable no-eval */

export function init(CONST, VAR, FUNC, robot, params) {
  // PARAMETERS:
  CONST.maxAngularSpeed = 0.1;
  CONST.maxForwardSpeed = 2.5;
  CONST.minPheromoneToFollow = 100;

  FUNC.getNewAngularSpeed = () => Math.random() * CONST.maxAngularSpeed * 2 - CONST.maxAngularSpeed;
  FUNC.getNewForwardSpeed = () => Math.random() * CONST.maxForwardSpeed * CONST.maxForwardSpeed;

  VAR.angularSpeed = FUNC.getNewAngularSpeed();
  VAR.forwardSpeed = FUNC.getNewForwardSpeed();
  VAR.minPheromoneToFollow = 0;
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

    // Manipulate the pheromone field to leave a trail.
    actuators.field.activate(
      robot.scene.fields.pheromone,
      [
        [[255, 255, 255, 255], [255, 255, 255, 255], [255, 255, 255, 255]],
        [[255, 255, 255, 255], [255, 255, 255, 255], [255, 255, 255, 255]],
        [[255, 255, 255, 255], [255, 255, 255, 255], [255, 255, 255, 255]]
      ],
      robot.sensors.position
    );

    const left = sensors.fields.readings.pheromone.left?.[0] || 0;
    const right = sensors.fields.readings.pheromone.right?.[0] || 0;

    if (left > CONST.minPheromoneToFollow && left > right) {
      VAR.angularSpeed = - CONST.maxAngularSpeed;
    } else if (right > CONST.minPheromoneToFollow) {
      VAR.angularSpeed = CONST.maxAngularSpeed;
    } else {
      VAR.angularSpeed = FUNC.getNewAngularSpeed();
      VAR.forwardSpeed = FUNC.getNewForwardSpeed();
    }

    return {
      linearVel: VAR.forwardSpeed,
      angularVel: VAR.angularSpeed,
      type: robot.SPEED_TYPES.RELATIVE
    };
  };
}
