export default function controller(robot, { angularVelocityScale }) {
    // PARAMETERS:
    const maxAngularSpeed = 0.25;
    const maxForwardSpeed = 2.5;

    return (sensors) => {

        let forwardSpeed = 0;
        let angularSpeed = 0;

        console.log(robot);

        return {
            linearVel: forwardSpeed,
            angularVel: angularSpeed,
            type: robot.SPEED_TYPES.RELATIVE
        };
    };
}
