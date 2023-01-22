export default function controller(robot, { angularVelocityScale }) {
    // PARAMETERS:
    const tau = 0.75;
    const maxAngularSpeed = 1;
    const maxForwardSpeed = 2.5;
    const innie = false;

    function getAngularSpeed(sensors) {
        //var sensorReading = sensors.fields.heatMap.forward;

        //if (sensors.walls.includes('forward') || sensors.walls.includes('left') || sensors.walls.includes('right'))

        //if (sensors.otherRobots >= minNearbyNeighborsToTriggerWait)

        if (!sensors.fields.readings.heatMap.leftField ||
            !sensors.fields.readings.heatMap.frontField ||
            !sensors.fields.readings.heatMap.rightField)
            return 0;

        let l = (sensors.fields.readings.heatMap.leftField)[0] / 255;
        let c = (sensors.fields.readings.heatMap.frontField)[0] / 255;
        let r = (sensors.fields.readings.heatMap.rightField)[0] / 255;

        let leftPucks = sensors.circlePucks.readings.leftPucks;
        let rightPucks = sensors.circlePucks.readings.rightPucks;

        //console.log(`l: ${l.toPrecision(4)}, c: ${c.toPrecision(4)}, r: ${r.toPrecision(4)}`);
        //console.log(`leftPucks: ${leftPucks}, rightPucks: ${rightPucks}`);

        // if (OBSTACLE ON LEFT)
        //     
        if (r >= c && c >= l) {

            if (innie && rightPucks > 0) {
                return maxAngularSpeed;
            } else if (!innie && leftPucks > 0) {
                return - maxAngularSpeed;
            }

            if (c < tau) {
                return 0.3 * maxAngularSpeed;
            } else {
                return -0.3 * maxAngularSpeed;
            }
        } else if (c >= r && c >= l) {
            return - maxAngularSpeed;
        } else {
            return maxAngularSpeed;
        }
    }

    return (sensors) => {

        let forwardSpeed = maxForwardSpeed;
        let angularSpeed = getAngularSpeed(sensors);

        return {
            linearVel: forwardSpeed,
            angularVel: angularSpeed,
            type: robot.SPEED_TYPES.RELATIVE
        };
    };
}
