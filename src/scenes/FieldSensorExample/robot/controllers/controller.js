export default function controller(robot, { angularVelocityScale }) {

    return (sensors) => {

        //console.log(sensors.fields.sensingPoints.forward);

        return {
            linearVel: 0,
            angularVel: 0,
            type: robot.SPEED_TYPES.RELATIVE
        };
    };
}