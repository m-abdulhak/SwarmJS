export default function velocityController(robot, { angularVelocityScale }) {
    return (goal, sensors, actuators, point) => {

        /*
        // If goal point is reached (default)
        let linearVelX = 0;
        let linearVelY = 0;
        let angularVel = 0;
    
        if (robot.reached(point)) {
          return { linearVel: { x: 0, y: 0 }, angularVel };
        }
    
        const angle = angleBetweenThreePointsDeg(sensors.heading, sensors.position, point);
        const directionOnRight = pointIsOnRightSideOfVector(
          sensors.heading.x,
          sensors.heading.y,
          sensors.position.x,
          sensors.position.y,
          point.x,
          point.y
        );
    
        if (angle < 5) {
          linearVelX = robot.velocityScale * (sensors.heading.x - sensors.position.x);
          linearVelY = robot.velocityScale * (sensors.heading.y - sensors.position.y);
        } else if (directionOnRight) {
          angularVel = -1 * angularVelocityScale * angle;
        } else {
          angularVel = angularVelocityScale * angle;
        }
    
        const linearVel = { x: linearVelX / 50, y: linearVelY / 50 };
        */

        let forwardSpeed = 3;

        let angularMax = 1;
        let angularSpeed = angularMax*Math.random() - angularMax / 2;

        let theta = sensors.orientation;
        const linearVel = { x: forwardSpeed * Math.cos(theta), y: forwardSpeed * Math.sin(theta) };

        return { linearVel, angularVel: angularSpeed };
    };
}
