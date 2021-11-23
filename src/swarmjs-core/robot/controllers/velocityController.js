import { angleBetweenThreePointsDeg, pointIsOnRightSideOfVector } from '../../geometry';

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
  //     newXVel = robot.velocityScale * (point.x - robot.position.x);
  //     newYVel = robot.velocityScale * (point.y - robot.position.y);
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

    const angle = angleBetweenThreePointsDeg(robot.headingPoint, robot.position, point);
    const directionOnRight = pointIsOnRightSideOfVector(
      robot.headingPoint.x,
      robot.headingPoint.y,
      robot.position.x,
      robot.position.y,
      point.x,
      point.y
    );

    if (angle < 15) {
      linearVelX = (robot.headingPoint.x - robot.position.x);
      linearVelY = (robot.headingPoint.y - robot.position.y);
    } else if (directionOnRight) {
      angularVel = -1 * angularVelocityScale * angle;
    } else {
      angularVel = angularVelocityScale * angle;
    }

    const linearVel = { x: linearVelX, y: linearVelY };

    return { linearVel, angularVel };
  };

  return () => {
    // const { linearVel, angularVel } = updateVelocityOmniDirectional(robot.tempGoal);
    const { linearVel, angularVel } = updateVelocityDiffRobot(robot.tempGoal);

    return {
      linearVel,
      angularVel
    };
  };
}
