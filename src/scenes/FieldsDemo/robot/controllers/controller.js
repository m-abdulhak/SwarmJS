/* eslint-disable no-param-reassign */
/* eslint-disable default-param-last */
/* eslint-disable no-eval */

export function init(CONST, VAR, FUNC, robot, params) {
  CONST.maxAngularSpeed = 0.1;
  CONST.maxForwardSpeed = 2.5;
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
        [[0, 255, 0, 255], [0, 255, 0, 255], [0, 255, 0, 255]],
        [[0, 255, 0, 255], [0, 255, 0, 255], [0, 255, 0, 255]],
        [[0, 255, 0, 255], [0, 255, 0, 255], [0, 255, 0, 255]]
      ],
      robot.sensors.position
    );

    // Sense just the green channel of the RGBA image.
    const leftField = sensors.fields.readings.pheromone.left?.[1] || 0;
    const rightField = sensors.fields.readings.pheromone.right?.[1] || 0;

    const leftObs = sensors.circles.left.reading.walls + sensors.circles.left.reading.robots;
    const rightObs = sensors.circles.right.reading.walls + sensors.circles.right.reading.robots;

    let forwardSpeed = CONST.maxForwardSpeed;
    let angularSpeed = 0;
    if (leftObs > 0) {
      angularSpeed = CONST.maxAngularSpeed;
    } else if (rightObs > 0) {
      angularSpeed = -CONST.maxAngularSpeed;
    } else if (leftField > 0 && leftField > rightField) {
      angularSpeed = - CONST.maxAngularSpeed;
    } else if (rightField > 0) {
      angularSpeed = CONST.maxAngularSpeed;
    } else {
      angularSpeed = 0;
    }

    return {
      linearVel: forwardSpeed,
      angularVel: angularSpeed,
      type: robot.SPEED_TYPES.RELATIVE
    };
  };
}
