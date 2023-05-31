/* eslint-disable no-eval */
export default function controller(robot, params, onLoop) {
  // PARAMETERS:
  const maxAngularSpeed = 0.1;
  const maxForwardSpeed = 5;

  if (onLoop) {
    const func = eval(onLoop);

    if (func && typeof func === 'function') {
      return func;
    }
  }

  return (sensors) => {

    console.log(sensors);

    let forwardSpeed = 0;
    let angularSpeed = 0;

    return {
      linearVel: forwardSpeed,
      angularVel: angularSpeed,
      type: robot.SPEED_TYPES.RELATIVE
    };
  };
}
