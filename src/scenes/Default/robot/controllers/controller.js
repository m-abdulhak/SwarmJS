/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */
/* eslint-disable no-eval */
export default function controller(robot, params, userDefinedFunc) {
  // CONSTANTS
  const CONSTANTS = {
    maxAngularSpeed: 0.1,
    maxForwardSpeed: 5,
    minNearbyNeighborsToTriggerWait: 1,
    minTurnTime: 5,
    maxTurnTime: 10
  };

  Object.freeze(CONSTANTS);

  const ROBOT_STATE = {
    MOVE_FORWARD: 'MOVE_FORWARD',
    TURN: 'TURN',
    WAIT: 'WAIT'
  };

  // STATE
  const STATE = {
    movementState: ROBOT_STATE.MOVE_FORWARD,
    stateTimeOut: 0,
    turnDir: 1 // 1 for clockwise, -1 for counter-clockwise
  };

  if (userDefinedFunc) {
    const func = eval(userDefinedFunc);

    if (func && typeof func === 'function') {
      return func;
    }
  }

  return (sensors) => {
    sensors.potentialWaitTime = 0; // Putting this in 'sensors' to be visualized in renderables.js.

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

    if (STATE.movementState === ROBOT_STATE.MOVE_FORWARD) {
      if (sensors.walls.includes('forward') || sensors.walls.includes('left') || sensors.walls.includes('right')) {
        enterTurnState();
      } else if (sensors.otherRobots >= CONSTANTS.minNearbyNeighborsToTriggerWait) {
        STATE.stateTimeOut = sensors.potentialWaitTime;
        STATE.movementState = ROBOT_STATE.WAIT;
      }
    } else if (STATE.movementState === ROBOT_STATE.TURN) {
      if (STATE.stateTimeOut <= 0) {
        STATE.movementState = ROBOT_STATE.MOVE_FORWARD;
      }
    } else if (STATE.movementState === ROBOT_STATE.WAIT) {
      if (STATE.stateTimeOut <= 0) {
        enterTurnState();
      }
    }

    //
    // Actions based on current state
    //
    let forwardSpeed = 0;
    let angularSpeed = 0;
    if (STATE.movementState === ROBOT_STATE.MOVE_FORWARD) {
      // Go full speed ahead.
      forwardSpeed = CONSTANTS.maxForwardSpeed;
    } else if (STATE.movementState === ROBOT_STATE.TURN) {
      angularSpeed = STATE.turnDir * CONSTANTS.maxAngularSpeed;
    } else if (STATE.movementState === ROBOT_STATE.WAIT) {
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
      STATE.movementState = ROBOT_STATE.TURN;
    }
  };
}
