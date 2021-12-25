import { angleBetweenThreePointsDeg, pointIsOnRightSideOfVector } from '../../utils/geometry';

const angularVelocityScale = 0.01;

// Returns a function that takes a target and returns a velocity vector
// Example: { linearVel: { x: 0, y: 0 }, angularVel: 0 }
export default function updateVelocity(robot) {
  // const updateVelocityOmniDirectional = (point) => {
  //   // If goal point is reached (default)
  //   let newXVel = 0;
  //   let newYVel = 0;

  //   // else
  //   if (!robot.reached(point)) {
  //     newXVel = robot.velocityScale * (point.x - robot.sensors.position.x);
  //     newYVel = robot.velocityScale * (point.y - robot.sensors.position.y);
  //   }

  //   const linearVel = { x: newXVel / 100, y: newYVel / 100 };
  //   const angularVel = 0;

  //   return { linearVel, angularVel };
  // };

  const updateVelocityDiffRobot = (point) => {
    // If goal point is reached (default)
    let linearVelX = 0;
    let linearVelY = 0;
    let angularVel = 0;

    if (robot.reached(point)) {
      return { linearVel: { x: 0, y: 0 }, angularVel };
    }

    const angle = angleBetweenThreePointsDeg(robot.sensors.heading, robot.sensors.position, point);
    const directionOnRight = pointIsOnRightSideOfVector(
      robot.sensors.heading.x,
      robot.sensors.heading.y,
      robot.sensors.position.x,
      robot.sensors.position.y,
      point.x,
      point.y
    );

    if (angle < 5) {
      linearVelX = robot.velocityScale * (robot.sensors.heading.x - robot.sensors.position.x);
      linearVelY = robot.velocityScale * (robot.sensors.heading.y - robot.sensors.position.y);
    } else if (directionOnRight) {
      angularVel = -1 * angularVelocityScale * angle;
    } else {
      angularVel = angularVelocityScale * angle;
    }

    const linearVel = { x: linearVelX / 50, y: linearVelY / 50 };

    return { linearVel, angularVel };
  };

  return () => {
    // const { linearVel, angularVel } = updateVelocityOmniDirectional(robot.waypoint);
    const { linearVel, angularVel } = updateVelocityDiffRobot(robot.waypoint);

    return {
      linearVel,
      angularVel
    };
  };
}
