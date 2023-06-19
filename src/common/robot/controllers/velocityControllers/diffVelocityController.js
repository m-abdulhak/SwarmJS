/* eslint-disable default-param-last */
/* eslint-disable no-eval */
import { angleBetweenThreePointsDeg, pointIsOnRightSideOfVector } from '../../../utils/geometry';

export default function diffVelocityController(robot, { angularVelocityScale = 0.001 } = {}, onLoop, onInit) {
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

    return { linearVel, angularVel };
  };
}
