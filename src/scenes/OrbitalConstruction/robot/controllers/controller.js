/* eslint-disable no-param-reassign */
/* eslint-disable default-param-last */
/* eslint-disable no-eval */

export function init(CONST, VAR, FUNC, robot, params) {
  // PARAMETERS:
  CONST.middleTau = params.tau || 0.6;
  CONST.maxAngularSpeed = 0.015;
  CONST.maxForwardSpeed = 0.2;

  // We'll define 25% of the robots as innies (pretty arbitrary)
  CONST.innie = Math.random() < 0.25;
  CONST.tau = CONST.innie ? CONST.middleTau + 0.05 : CONST.middleTau - 0.05;
  if (robot) {
    if (CONST.innie) {
      robot.color = 'yellow';
    } else {
      robot.color = 'cyan';
    }
  }

  FUNC.getAngularSpeed = (sensors) => {
    if (!sensors.fields.readings.heatMap.leftField
        || !sensors.fields.readings.heatMap.frontField
        || !sensors.fields.readings.heatMap.rightField) {
      return 0;
    }

    const l = (sensors.fields.readings.heatMap.leftField)[0] / 255;
    const c = (sensors.fields.readings.heatMap.frontField)[0] / 255;
    const r = (sensors.fields.readings.heatMap.rightField)[0] / 255;

    const leftPucks = sensors.polygons.left.reading.pucks;
    const rightPucks = sensors.polygons.right.reading.pucks;
    // console.log(`l: ${l.toPrecision(4)}, c: ${c.toPrecision(4)}, r: ${r.toPrecision(4)}`);
    // console.log(`leftPucks: ${leftPucks}, rightPucks: ${rightPucks}`);

    if (sensors.circles.leftObstacle.reading.robots > 0 || sensors.circles.leftObstacle.reading.walls > 0) {
      return CONST.maxAngularSpeed;
    }
    if (r >= c && c >= l) {
      if (CONST.innie && rightPucks > 0) {
        return CONST.maxAngularSpeed;
      } if (!CONST.innie && leftPucks > 0) {
        return -CONST.maxAngularSpeed;
      }

      if (c < CONST.tau) {
        return 0.3 * CONST.maxAngularSpeed;
      }
      return -0.3 * CONST.maxAngularSpeed;
    } if (c >= r && c >= l) {
      return -CONST.maxAngularSpeed;
    }
    return CONST.maxAngularSpeed;
  };
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
    const forwardSpeed = CONST.maxForwardSpeed;
    const angularSpeed = FUNC.getAngularSpeed(sensors);

    return {
      linearVel: forwardSpeed * robot.velocityScale,
      angularVel: angularSpeed * robot.velocityScale,
      type: robot.SPEED_TYPES.RELATIVE
    };
  };
}
