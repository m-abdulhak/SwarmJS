export function init(CONST, VAR, FUNC, robot, params) {
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
} // init()

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
    var command = {
      linearVel: 0,
      angularVel: 0,
      type: robot.SPEED_TYPES.RELATIVE
    };
    if (sensors.fields.readings.heatMap.leftField == null || robot.externalVelocity === undefined) {
      console.log("Sensors not readable yet.");
      return command;
    }

    command.linearVel =  robot.externalVelocity.linearVel * robot.velocityScale;
    command.angularVel =  robot.externalVelocity.angularVel * robot.velocityScale;

    // //! /* to slove canvas error */
    command.linearVel = isNaN(command.linearVel) ? 0 : command.linearVel;
    command.angularVel = isNaN(command.angularVel) ? 0 : command.angularVel;

    console.log(">>>> controller returning command" ,command , "by order", robot.externalVelocity)
    return command;
  };
}
