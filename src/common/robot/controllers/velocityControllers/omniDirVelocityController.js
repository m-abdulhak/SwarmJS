/* eslint-disable no-eval */
// Returns a function that takes a target and returns a velocity vector
// Example: { linearVel: { x: 0, y: 0 }, angularVel: 0 }
export default function omniDirVelocityController(robot, params, onLoop, onInit) {
  // CONSTANTS
  const CONSTANTS = {};

  // STATE
  const STATE = {};

  let initFunc = () => {};
  if (onInit) {
    const userDefinedInitFunc = eval(onInit);

    if (userDefinedInitFunc && typeof userDefinedInitFunc === 'function') {
      initFunc = userDefinedInitFunc;
    }
  }

  initFunc(CONSTANTS, STATE, robot);

  Object.freeze(CONSTANTS);

  if (onLoop) {
    const func = eval(onLoop);

    if (func && typeof func === 'function') {
      return func;
    }
  }

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
