/* eslint-disable no-param-reassign */
/* eslint-disable default-param-last */
/* eslint-disable no-eval */

import Socket from '@common/utils/socket';

/* This part is different from original: sensor retrieveing part*/
export function init(CONST, VAR, FUNC, robot, params) {
  // PARAMETERS:
  // CONST.SOCKET_URL = 'ws://localhost:5000';
  // CONST.SOCKET_URL = 'http://127.0.0.1:5000'
  // CONST.SOCKET_URL = 'http://localhost:5000'
  CONST.SOCKET_URL = 'http://127.0.0.1:5000';

  
  CONST.middleTau = params.tau || 0.6;
  CONST.maxAngularSpeed = 0.015;
  CONST.maxForwardSpeed = 0.2;

  VAR.socket = new Socket(CONST.SOCKET_URL);
  VAR.socket.connect();
  VAR.socket.ping();

  VAR.receivedSpeeds = {};

  // Add callback to store robot speeds received by external engine
  VAR.socket.on('robot_speeds', (data) => {
    const speeds = Object.entries(data).reduce((acc, [k, v]) => {
      const strKey = `${k}`;
      acc[strKey] = v;
      return acc;
    }, {});

    console.log('>>>>>>>>>>>>>received robot speeds', speeds);
    VAR.receivedSpeeds = speeds;
  });
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

    //
    // Sensor variables that we might want to pass...
    //

    //console.log(sensors);

    // Integers in the range 0 - 255:
    const leftField = (sensors.fields.readings.heatMap.leftField)[0];
    const centreField = (sensors.fields.readings.heatMap.frontField)[0];
    const rightField = (sensors.fields.readings.heatMap.rightField)[0];

    // Positive integers (unbounded, but generally small)
    const leftPucks = sensors.polygons.left.reading.pucks;
    const rightPucks = sensors.polygons.right.reading.pucks;

    // We'll make these Boolean since the number shouldn't really change the response.
    const leftRobots = sensors.circles.leftObstacle.reading.robots > 0;
    const leftWalls =  sensors.circles.leftObstacle.reading.walls > 0;

    // We want the controller to determine the forward speed and angular speed.
    let forwardSpeed = 0;
    let angularSpeed = 0;

    //
    // CONTROLLER CODE
    //
    let passedData = { data: '???' };
    VAR.socket.emit('get_robot_speeds', passedData);

    // HOW DO WE WAIT FOR A RESPONSE FROM THE SERVER???

    command.linearVel = VAR.receivedSpeeds.forwardSpeed * robot.velocityScale * CONST.maxForwardSpeed;
    command.angularVel = VAR.receivedSpeeds.angularSpeed * robot.velocityScale * CONST.maxAngularSpeed;

    /* to slove canvas error */
    command.linearVel = isNaN(command.linearVel) ? 0 : command.linearVel;
    command.angularVel = isNaN(command.angularVel) ? 0 : command.angularVel;

    // debugger;
    return command;
  };
}
