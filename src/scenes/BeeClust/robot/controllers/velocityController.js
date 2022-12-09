export default function velocityController(robot, { angularVelocityScale }) {
    // PARAMETERS:
    const neighborSensingRadius = 30;
    const angularMax = 1;
    const maxForwardSpeed = 3;

    var state = "NORMAL";
    var stateTimeOut = 0;

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

        if (nNearby >= 2) {
            state = "WAIT";
            stateTimeOut = 100;
        } else if (stateTimeOut == 0) {
            state = "NORMAL";
        }

        //
        // Actions based on current state
        //

        if (state == "NORMAL") {
            // Choose a random angle.
            let angularSpeed = angularMax*Math.random() - angularMax / 2;

            let theta = sensors.orientation;
            const linearVel = { x: maxForwardSpeed * Math.cos(theta), y: maxForwardSpeed * Math.sin(theta) };

            return { linearVel, angularVel: angularSpeed };

        } else if (state == "WAIT") {
            const linearVel = { x: 0, y: 0 };
            return { linearVel, angularVel: 0 };
        }
    };
}
