/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */
/* eslint-disable no-eval */
export function init(CONST, VAR) {
  CONST.maxAngularSpeed = 0.1;
  CONST.maxForwardSpeed = 5;
  CONST.minNearbyNeighborsToTriggerWait = 1;
  CONST.minTurnTime = 5;
  CONST.maxTurnTime = 1;
  CONST.ROBOT_STATE = {
    MOVE_FORWARD: 'MOVE_FORWARD',
    TURN: 'TURN',
    WAIT: 'WAIT'
  };

  VAR.movementState = CONST.ROBOT_STATE.MOVE_FORWARD;
  VAR.stateTimeOut = 0;
  VAR.turnDir = 1; // 1 for clockwise, -1 for counter-clockwise
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
    sensors.potentialWaitTime = 0; // Putting this in 'sensors' to be visualized in renderables.js.

    for (const f of (Object.values(robot.scene.fields || {}))) {
      actuators.field.activate(
        f,
        [
          [[255, 0, 255, 255], [255, 0, 255, 255], [255, 0, 255, 255]],
          [[255, 0, 255, 255], [255, 0, 255, 255], [255, 0, 255, 255]],
          [[255, 0, 255, 255], [255, 0, 255, 255], [255, 0, 255, 255]]
        ],
        robot.sensors.position
      );
    }

    const sensorReading = sensors.fields.readings.heatMap.forward;
    if (sensorReading) {
      const temperatureScaled = sensorReading[0] / 256;

      // This would be more consistent with the paper, but this form
      // is harder to tune for a given temperature field.
      // sensors.potentialWaitTime = 50 * temperatureScaled ** 2 / (temperatureScaled ** 2 + 0.25);

      // The following shifts the wait-time function to the right, making
      // it 0 for all values below tempShift.
      const tempShift = 0.4;
      if (temperatureScaled < tempShift) {
        sensors.potentialWaitTime = 0;
      } else {
        const v1 = 50 * (temperatureScaled - tempShift) ** 2;
        const v2 = (temperatureScaled - tempShift) ** 2 + 0.05;
        sensors.potentialWaitTime = v1 / v2;
      }
    }

    //
    // State transitions
    //
    VAR.stateTimeOut -= 1;

    if (VAR.movementState === CONST.ROBOT_STATE.MOVE_FORWARD) {
      if (sensors.walls.includes('forward') || sensors.walls.includes('left') || sensors.walls.includes('right')) {
        enterTurnState();
      } else if (sensors.otherRobots >= CONST.minNearbyNeighborsToTriggerWait) {
        VAR.stateTimeOut = sensors.potentialWaitTime;
        VAR.movementState = CONST.ROBOT_STATE.WAIT;
      }
    } else if (VAR.movementState === CONST.ROBOT_STATE.TURN) {
      if (VAR.stateTimeOut <= 0) {
        VAR.movementState = CONST.ROBOT_STATE.MOVE_FORWARD;
      }
    } else if (VAR.movementState === CONST.ROBOT_STATE.WAIT) {
      if (VAR.stateTimeOut <= 0) {
        enterTurnState();
      }
    }

    //
    // Actions based on current state
    //
    let forwardSpeed = 0;
    let angularSpeed = 0;
    if (VAR.movementState === CONST.ROBOT_STATE.MOVE_FORWARD) {
      // Go full speed ahead.
      forwardSpeed = CONST.maxForwardSpeed;
    } else if (VAR.movementState === CONST.ROBOT_STATE.TURN) {
      angularSpeed = VAR.turnDir * CONST.maxAngularSpeed;
    } else if (VAR.movementState === CONST.ROBOT_STATE.WAIT) {
      // Keep the default speeds of 0, 0.
    }

    return {
      linearVel: forwardSpeed,
      angularVel: angularSpeed,
      type: robot.SPEED_TYPES.RELATIVE
    };

    // Helper function
    function enterTurnState() {
      const turnTimeDiff = (CONST.maxTurnTime - CONST.minTurnTime);
      VAR.stateTimeOut = CONST.minTurnTime + turnTimeDiff * Math.random();
      if (sensors.walls.includes('left')) {
        VAR.turnDir = 1;
      } else if (sensors.walls.includes('right')) {
        VAR.turnDir = -1;
      } else {
        VAR.turnDir = Math.random() < 0.5 ? -1 : 1;
      }
      VAR.movementState = CONST.ROBOT_STATE.TURN;
    }
  };
}
