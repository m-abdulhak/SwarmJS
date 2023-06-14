/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */
/* eslint-disable no-eval */
export function init(CONSTANTS, STATE) {
  CONSTANTS.maxAngularSpeed = 0.1;
  CONSTANTS.maxForwardSpeed = 5;
  CONSTANTS.minNearbyNeighborsToTriggerWait = 1;
  CONSTANTS.minTurnTime = 5;
  CONSTANTS.maxTurnTime = 1;
  CONSTANTS.ROBOT_STATE = {
    MOVE_FORWARD: 'MOVE_FORWARD',
    TURN: 'TURN',
    WAIT: 'WAIT'
  };

  STATE.movementState = CONSTANTS.ROBOT_STATE.MOVE_FORWARD;
  STATE.stateTimeOut = 0;
  STATE.turnDir = 1; // 1 for clockwise, -1 for counter-clockwise
}

export function controller(robot, params, onLoop, onInit) {
  // CONSTANTS
  const CONSTANTS = {};

  // STATE
  const STATE = {};

  let initFunc = init;
  if (onInit) {
    const userDefinedInitFunc = eval(onInit);

    if (userDefinedInitFunc && typeof userDefinedInitFunc === 'function') {
      initFunc = userDefinedInitFunc;
    }
  }

  initFunc(CONSTANTS, STATE, robot);

  Object.freeze(CONSTANTS);

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
    STATE.stateTimeOut -= 1;

    if (STATE.movementState === CONSTANTS.ROBOT_STATE.MOVE_FORWARD) {
      if (sensors.walls.includes('forward') || sensors.walls.includes('left') || sensors.walls.includes('right')) {
        enterTurnState();
      } else if (sensors.otherRobots >= CONSTANTS.minNearbyNeighborsToTriggerWait) {
        STATE.stateTimeOut = sensors.potentialWaitTime;
        STATE.movementState = CONSTANTS.ROBOT_STATE.WAIT;
      }
    } else if (STATE.movementState === CONSTANTS.ROBOT_STATE.TURN) {
      if (STATE.stateTimeOut <= 0) {
        STATE.movementState = CONSTANTS.ROBOT_STATE.MOVE_FORWARD;
      }
    } else if (STATE.movementState === CONSTANTS.ROBOT_STATE.WAIT) {
      if (STATE.stateTimeOut <= 0) {
        enterTurnState();
      }
    }

    //
    // Actions based on current state
    //
    let forwardSpeed = 0;
    let angularSpeed = 0;
    if (STATE.movementState === CONSTANTS.ROBOT_STATE.MOVE_FORWARD) {
      // Go full speed ahead.
      forwardSpeed = CONSTANTS.maxForwardSpeed;
    } else if (STATE.movementState === CONSTANTS.ROBOT_STATE.TURN) {
      angularSpeed = STATE.turnDir * CONSTANTS.maxAngularSpeed;
    } else if (STATE.movementState === CONSTANTS.ROBOT_STATE.WAIT) {
      // Keep the default speeds of 0, 0.
    }

    return {
      linearVel: forwardSpeed,
      angularVel: angularSpeed,
      type: robot.SPEED_TYPES.RELATIVE
    };

    // Helper function
    function enterTurnState() {
      const turnTimeDiff = (CONSTANTS.maxTurnTime - CONSTANTS.minTurnTime);
      STATE.stateTimeOut = CONSTANTS.minTurnTime + turnTimeDiff * Math.random();
      if (sensors.walls.includes('left')) {
        STATE.turnDir = 1;
      } else if (sensors.walls.includes('right')) {
        STATE.turnDir = -1;
      } else {
        STATE.turnDir = Math.random() < 0.5 ? -1 : 1;
      }
      STATE.movementState = CONSTANTS.ROBOT_STATE.TURN;
    }
  };
}
