export default function controller(robot, { angularVelocityScale }) {
    // PARAMETERS:
    const maxAngularSpeed = 0.1;
    const maxForwardSpeed = 5;
    const minNearbyNeighborsToTriggerWait = 1;
    const minTurnTime = 5;
    const maxTurnTime = 10;

    const ROBOT_STATE = {
        NORMAL: 'MOVE_FORWARD',
        TURN: 'TURN',
        WAIT: 'WAIT'
    };

    let state = ROBOT_STATE.MOVE_FORWARD;
    let stateTimeOut = 0;
    let turnDir = 1; // 1 for clockwise, -1 for counter-clockwise

    function enterTurnState(sensors) {
        stateTimeOut = minTurnTime + (maxTurnTime - minTurnTime) * Math.random();
        if (sensors.walls.includes('left'))
            turnDir = 1;
        else if (sensors.walls.includes('right'))
            turnDir = -1;
        else
            turnDir = Math.random() < 0.5 ? -1 : 1;
        state = ROBOT_STATE.TURN;
    }

    return (sensors) => {

        // Putting this in 'sensors' to be visualized in renderables.js.
        sensors.potentialWaitTime = 0;

        var sensorReading = sensors.fields.heatMap.forward;
        if (sensorReading) {
            var temperatureScaled = sensorReading[0] / 256;

            // This would be more consistent with the paper, but this form
            // is harder to tune for a given temperature field.
            // sensors.potentialWaitTime = 50 * temperatureScaled ** 2 / (temperatureScaled ** 2 + 0.25);

            // The following shifts the wait-time function to the right, making
            // it 0 for all values below tempShift.
            const tempShift = 0.4;
            if (temperatureScaled < tempShift)
                sensors.potentialWaitTime = 0;
            else
                sensors.potentialWaitTime = 50 * (temperatureScaled-tempShift)**2 / ((temperatureScaled-tempShift)**2 + 0.05) 
        }

        //
        // State transitions...
        //
        stateTimeOut -= 1;

        if (state == ROBOT_STATE.MOVE_FORWARD) {

            if (sensors.walls.includes('forward') || sensors.walls.includes('left') || sensors.walls.includes('right')) {
                enterTurnState(sensors);

            } else if (sensors.otherRobots >= minNearbyNeighborsToTriggerWait) {
                stateTimeOut = sensors.potentialWaitTime
                state = ROBOT_STATE.WAIT;
            }
        } else if (state == ROBOT_STATE.TURN) {
            if (stateTimeOut <= 0) {
                state = ROBOT_STATE.MOVE_FORWARD;
            }

        } else if (state == ROBOT_STATE.WAIT) {
            if (stateTimeOut <= 0) {
                enterTurnState(sensors);
            }
        }

        //
        // Actions based on current state
        //
        let forwardSpeed = 0;
        let angularSpeed = 0;
        if (state === ROBOT_STATE.MOVE_FORWARD) {
            // Go full speed ahead.
            forwardSpeed = maxForwardSpeed;
        } else if (state === ROBOT_STATE.TURN) {
            angularSpeed = turnDir * maxAngularSpeed;
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
