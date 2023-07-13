/* eslint-disable no-param-reassign */
/* eslint-disable default-param-last */
/* eslint-disable no-eval */

export function init(CONST, VAR, FUNC, robot, params) {
  // PARAMETERS:
  CONST.theta = params.theta || 0.1;
  CONST.maxAngularSpeed = 0.1;
  CONST.maxForwardSpeed = 5;
  CONST.minNearbyNeighborsToTriggerWait = 1;
  CONST.minTurnTime = 5;
  CONST.maxTurnTime = 10;
  CONST.maxWaitTime = 100;
  CONST.tempShift = 0.75;

  CONST.ROBOT_STATE = {
    MOVE_FORWARD: 'MOVE_FORWARD',
    TURN: 'TURN',
    WAIT: 'WAIT'
  };

  VAR.state = CONST.ROBOT_STATE.MOVE_FORWARD;
  VAR.timeOut = 0;
  VAR.turnDir = 1; // 1 for clockwise, -1 for counter-clockwise

  FUNC.enterTurnState = (sensors) => {
    VAR.timeOut = CONST.minTurnTime + (CONST.maxTurnTime - CONST.minTurnTime) * Math.random();
    if (sensors.circles.left.reading.walls > 0) {
      VAR.turnDir = 1;
    } else if (sensors.circles.right.reading.walls > 0) {
      VAR.turnDir = -1;
    } else {
      VAR.turnDir = Math.random() < 0.5 ? -1 : 1;
    }
    VAR.state = CONST.ROBOT_STATE.TURN;
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
    // Putting this in 'sensors' to be visualized in renderables.js.
    sensors.potentialWaitTime = 0;

    const sensorReading = sensors.fields.readings.temperature.forward;
    if (sensorReading) {
      const temperatureScaled = sensorReading[0] / 256;

      // This would be more consistent with the paper, but this form
      // is harder to tune for a given temperature field.
      // sensors.potentialWaitTime = Math.ceil(maxWaitTime * temperatureScaled ** 2 / (temperatureScaled ** 2 + theta));

      // The following shifts the wait-time function to the right, making
      // it 0 for all values below tempShift.
      if (temperatureScaled < CONST.tempShift) {
        sensors.potentialWaitTime = 0;
      } else {
        sensors.potentialWaitTime = Math.ceil(
          (CONST.maxWaitTime * (temperatureScaled - CONST.tempShift) ** 2)
          / ((temperatureScaled - CONST.tempShift) ** 2 + CONST.theta)
        );
      }
    }

    //
    // State transitions...
    //
    VAR.timeOut -= 1;

    if (VAR.state === CONST.ROBOT_STATE.MOVE_FORWARD) {
      if (sensors.circles.left.reading.walls > 0 || sensors.circles.right.reading.walls > 0) {
        FUNC.enterTurnState(sensors);
      } else if (
        sensors.circles.ahead.reading.robots >= CONST.minNearbyNeighborsToTriggerWait
        && sensors.potentialWaitTime > 0
      ) {
        VAR.timeOut = sensors.potentialWaitTime;
        VAR.state = CONST.ROBOT_STATE.WAIT;
      }
    } else if (VAR.state === CONST.ROBOT_STATE.TURN) {
      if (VAR.timeOut <= 0) {
        VAR.state = CONST.ROBOT_STATE.MOVE_FORWARD;
      }
    } else if (VAR.state === CONST.ROBOT_STATE.WAIT) {
      if (VAR.timeOut <= 0) {
        FUNC.enterTurnState(sensors);
      }
    }

    //
    // Actions based on current VAR.state
    //
    let forwardSpeed = 0;
    let angularSpeed = 0;
    if (VAR.state === CONST.ROBOT_STATE.MOVE_FORWARD) {
      // Go full speed ahead.
      forwardSpeed = CONST.maxForwardSpeed;
    } else if (VAR.state === CONST.ROBOT_STATE.TURN) {
      angularSpeed = VAR.turnDir * CONST.maxAngularSpeed;
    } else if (VAR.state === CONST.ROBOT_STATE.WAIT) {
      // Keep the default speeds of 0, 0.
    }

    return {
      linearVel: forwardSpeed,
      angularVel: angularSpeed,
      type: robot.SPEED_TYPES.RELATIVE
    };
  };
}
