export default function velocityController(robot, { angularVelocityScale }) {
    // PARAMETERS:
    const neighborSensingRadius = 30;
    const angularMax = 1;
    const maxForwardSpeed = 3;
    const minNearbyNeighborsToTriggerWait = 2;

    // State of the robot which can be either "NORMAL" or "WAIT".
    // BAD: Does JS have something like enums to make sure the state is only
    // one of the above?
    var state = "NORMAL";
    var stateTimeOut = 0;

    // BAD: There should be a type of controller which is provided only with
    // sensors.
    return (goal, sensors, actuators, point) => {

        //
        // State transitions...
        //

        stateTimeOut -= 1;

        // Determine number of neighbors within a fixed radius.
        var nNearby = 0;
        for (var neighbor of sensors.neighbors) {
            if (robot.getDistanceTo(neighbor.body.position) < neighborSensingRadius) {
                nNearby += 1;
            }
        }

        if (nNearby >= minNearbyNeighborsToTriggerWait) {
            state = "WAIT";
            stateTimeOut = 100;
        } else if (stateTimeOut == 0) {
            state = "NORMAL";
        }

        //
        // Actions based on current state
        //

        let forwardSpeed = 0;
        let angularSpeed = 0;
        if (state == "NORMAL") {
            // Choose a random angle.
            angularSpeed = angularMax*Math.random() - angularMax / 2;

            // Go full speed ahead.
            forwardSpeed = maxForwardSpeed;

        } else if (state == "WAIT") {
            // Keep the default speeds of 0, 0.
        }

        // BAD: A robot should be able to supply a forward speed and angular
        // speed and then let the simulator figure out how to update its internal
        // representation of the robot's velocity.  Requiring knowledge of the
        // robot's orientation is inconsistent with the idea of a simple reactive
        // robot.

        // In other words, it would be nice to have a type of controller which
        // just returned forwardSpeed and angularSpeed.
        let theta = sensors.orientation;
        const linearVel = { x: forwardSpeed * Math.cos(theta), y: forwardSpeed * Math.sin(theta) };
        return { linearVel, angularVel: angularSpeed };
    };
}
