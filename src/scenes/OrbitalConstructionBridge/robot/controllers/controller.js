import {fetchAngularCommand} from '../../scene/pythonBridge';

export function init(CONST, VAR, FUNC, robot, params) {
  return CONST , robot.controllers.velocity.init ;

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
  /* This part is different from original*/
  return (sensors) => {
    var command = {
      linearVel: 0,
      angularVel: 0,
      type: robot.SPEED_TYPES.RELATIVE
    };
    if (sensors.fields.readings.heatMap.leftField == null) {
      console.log("Sensors not readable yet.");
      return command;
    }
    let forwardSpeed = CONST.maxForwardSpeed;
    let angularSpeed = fetchAngularCommand(robot.id);
    
    //! trick... if angular speed is 0 means bridge is on hold
    if (angularSpeed === 0) {
      forwardSpeed = 0;
    }
    
    command.linearVel = forwardSpeed * robot.velocityScale;

    command.angularVel = angularSpeed * robot.velocityScale;
    // //! /* to slove canvas error */
    command.linearVel = isNaN(command.linearVel) ? 0 : command.linearVel;
    command.angularVel = isNaN(command.angularVel) ? 0 : command.angularVel;
    console.log(">>>> controller returning command" ,command , "by order", angularSpeed)
    return command;
  };
}
