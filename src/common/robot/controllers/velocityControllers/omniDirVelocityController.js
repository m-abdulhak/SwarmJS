// Returns a function that takes a target and returns a velocity vector
// Example: { linearVel: { x: 0, y: 0 }, angularVel: 0 }
export default function omniDirVelocityController(robot) {
  return (sensors, actuators, goal, point) => {
    // If goal point is reached (default)
    let newXVel = 0;
    let newYVel = 0;

    // else
    if (!robot.reached(point)) {
      newXVel = robot.velocityScale * (point.x - robot.sensors.position.x);
      newYVel = robot.velocityScale * (point.y - robot.sensors.position.y);
    }

    const linearVel = { x: newXVel / 100, y: newYVel / 100 };
    const angularVel = 0;

    return { linearVel, angularVel };
  };
}
