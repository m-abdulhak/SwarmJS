/* eslint-disable no-eval */
export default function controller(robot, params, onLoop) {
  // PARAMETERS:
  const maxAngularSpeed = 0.005;
  const maxForwardSpeed = 0.15;
  const minTurnTime = 5;
  const maxTurnTime = 10;

  const ROBOT_STATE = {
    MOVE_FORWARD: 'MOVE_FORWARD',
    TURN: 'TURN'
  };

  let state = ROBOT_STATE.MOVE_FORWARD;
  let stateTimeOut = 0;
  const turnDir = 1; // 1 for clockwise, -1 for counter-clockwise

  function enterTurnState(sensors, newTurnDir) {
    stateTimeOut = minTurnTime + (maxTurnTime - minTurnTime) * Math.random();
    state = ROBOT_STATE.TURN;
  }

  if (onLoop) {
    const func = eval(onLoop);

    if (func && typeof func === 'function') {
      return func;
    }
  }

  return (sensors, actuators) => {
    const grabbedPuck = actuators.grabber.getState();

    //
    // State transitions...
    //
    stateTimeOut -= 1;

    if (state === ROBOT_STATE.MOVE_FORWARD) {
      if (sensors.circles.left.reading.walls > 0 || sensors.circles.left.reading.robots > 0) {
        enterTurnState(sensors, 1);
      } else if (sensors.circles.right.reading.walls > 0 || sensors.circles.right.reading.robots > 0) {
        enterTurnState(sensors, -1);
      } else if (
        !grabbedPuck && sensors.polygons.inner.reading.pucks === 1 && sensors.polygons.outer.reading.pucks == 0
      ) {
        robot.actuators.grabber.activate();
        // No need to change state.
      } else if (!grabbedPuck && sensors.polygons.inner.reading.pucks > 0 && sensors.polygons.outer.reading.pucks > 0) {
        // Turn to avoid this cluster.
        enterTurnState(sensors, Math.random() < 0.5 ? -1 : 1);
      } else if (grabbedPuck && sensors.polygons.inner.reading.pucks > 0) {
        robot.actuators.grabber.deactivate();
        enterTurnState(sensors, Math.random() < 0.5 ? -1 : 1);
      }
    } else if (state === ROBOT_STATE.TURN) {
      if (stateTimeOut <= 0) {
        state = ROBOT_STATE.MOVE_FORWARD;
      }
    }

    //
    // Actions based on current state
    //
    let forwardSpeed = 0;
    let angularSpeed = 0;
    if (state === ROBOT_STATE.MOVE_FORWARD) {
      // Go full speed ahead.
      forwardSpeed = maxForwardSpeed * robot.velocityScale;
    } else if (state === ROBOT_STATE.TURN) {
      angularSpeed = turnDir * maxAngularSpeed * robot.velocityScale;
    }

    return {
      linearVel: forwardSpeed,
      angularVel: angularSpeed,
      type: robot.SPEED_TYPES.RELATIVE
    };
  };
}
