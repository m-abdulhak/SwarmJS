export default function controller(robot, { angularVelocityScale }) {
    // PARAMETERS:
    const maxAngularSpeed = 0.25;
    const maxForwardSpeed = 2.5;

    // TRYING TO EXECUTE robot.scene.setup WILL NOT WORK BECAUSE THIS 
    // SECTION HAS ALREADY RUN.
    //console.log(robot.scene.setup);

    return (sensors) => {

        let forwardSpeed = 0;
        let angularSpeed = 0;

        //let result = eval(robot.scene.loop);
        console.log(robot.scene.loop);

        return {
            linearVel: forwardSpeed,
            angularVel: angularSpeed,
            type: robot.SPEED_TYPES.RELATIVE
        };
    };
}
