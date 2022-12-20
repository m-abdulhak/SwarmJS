export default function velocityController(robot, { angularVelocityScale }) {
  // PARAMETERS:
  const neighborSensingRadius = 30;
  const angularMax = 1;
  const maxForwardSpeed = 3;
  const minNearbyNeighborsToTriggerWait = 2;

  const ROBOT_STATE = {
    NORMAL: 'NORMAL',
    WAIT: 'WAIT'
  };

  // State of the robot which can be either "NORMAL" or "WAIT".
  let state = ROBOT_STATE.NORMAL;
  let stateTimeOut = 0;

  return (sensors) => {
    //
    // State transitions...
    //
    stateTimeOut -= 1;

    // Determine number of neighbors within a fixed radius.
    let nNearby = 0;
    for (const neighbor of sensors.neighbors) {
      if (robot.getDistanceTo(neighbor.body.position) < neighborSensingRadius) {
        nNearby += 1;
      }
    }

    if (nNearby >= minNearbyNeighborsToTriggerWait) {
      state = ROBOT_STATE.WAIT;
      stateTimeOut = 100;
    } else if (stateTimeOut === 0) {
      state = ROBOT_STATE.NORMAL;
    }

    //
    // Actions based on current state
    //
    let forwardSpeed = 0;
    let angularSpeed = 0;
    if (state === ROBOT_STATE.NORMAL) {
      // Choose a random angle.
      angularSpeed = angularMax * Math.random() - angularMax / 2;

      // Go full speed ahead.
      forwardSpeed = maxForwardSpeed;
    } else if (state === ROBOT_STATE.WAIT) {
      // Keep the default speeds of 0, 0.
    }

    return {
      linearVel: forwardSpeed,
      angularVel: angularSpeed,
      type: robot.SPEED_TYPES.RELATIVE
    };
  };
}
