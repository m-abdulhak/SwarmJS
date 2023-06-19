/* eslint-disable no-param-reassign */
/* eslint-disable no-eval */

export function init(CONST, VAR, FUNC, robot, params) {
  // PARAMETERS:
  CONST.maxAngularSpeed = 0.005;
  CONST.maxForwardSpeed = 0.15;
  CONST.minTurnTime = 5;
  CONST.maxTurnTime = 10;
  CONST.turnDir = 1; // 1 for clockwise, -1 for counter-clockwise

  CONST.ROBOT_STATE = {
    MOVE_FORWARD: 'MOVE_FORWARD',
    TURN: 'TURN'
  };

  VAR.state = CONST.ROBOT_STATE.MOVE_FORWARD;
  VAR.stateTimeOut = 0;

  FUNC.enterTurnState = (sensors, newTurnDir) => {
    VAR.stateTimeOut = CONST.minTurnTime + (CONST.maxTurnTime - CONST.minTurnTime) * Math.random();
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

  return (sensors, actuators) => {
    const grabbedPuck = actuators.grabber.getState();

    VAR.stateTimeOut -= 1;

    if (VAR.state === CONST.ROBOT_STATE.MOVE_FORWARD) {
      if (sensors.circles.left.reading.walls > 0 || sensors.circles.left.reading.robots > 0) {
        FUNC.enterTurnState(sensors, 1);
      } else if (sensors.circles.right.reading.walls > 0 || sensors.circles.right.reading.robots > 0) {
        FUNC.enterTurnState(sensors, -1);
      } else if (
        !grabbedPuck && sensors.polygons.inner.reading.pucks === 1 && sensors.polygons.outer.reading.pucks == 0
      ) {
        robot.actuators.grabber.activate();
        // No need to change state.
      } else if (!grabbedPuck && sensors.polygons.inner.reading.pucks > 0 && sensors.polygons.outer.reading.pucks > 0) {
        // Turn to avoid this cluster.
        FUNC.enterTurnState(sensors, Math.random() < 0.5 ? -1 : 1);
      } else if (grabbedPuck && sensors.polygons.inner.reading.pucks > 0) {
        robot.actuators.grabber.deactivate();
        FUNC.enterTurnState(sensors, Math.random() < 0.5 ? -1 : 1);
      }
    } else if (VAR.state === CONST.ROBOT_STATE.TURN) {
      if (VAR.stateTimeOut <= 0) {
        VAR.state = CONST.ROBOT_STATE.MOVE_FORWARD;
      }
    }

    //
    // Actions based on current state
    //
    let forwardSpeed = 0;
    let angularSpeed = 0;
    if (VAR.state === CONST.ROBOT_STATE.MOVE_FORWARD) {
      // Go full speed ahead.
      forwardSpeed = CONST.maxForwardSpeed * robot.velocityScale;
    } else if (VAR.state === CONST.ROBOT_STATE.TURN) {
      angularSpeed = CONST.turnDir * CONST.maxAngularSpeed * robot.velocityScale;
    }

    return {
      linearVel: forwardSpeed,
      angularVel: angularSpeed,
      type: robot.SPEED_TYPES.RELATIVE
    };
  };
}
