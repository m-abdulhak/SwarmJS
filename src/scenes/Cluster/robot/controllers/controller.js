/* eslint-disable no-eval */
export default function controller(robot, params, onLoop) {
  // PARAMETERS:
  const maxAngularSpeed = 0.5;
  const maxForwardSpeed = 2.5;

  if (onLoop) {
    const func = eval(onLoop);

    if (func && typeof func === 'function') {
      return func;
    }
  }

  return (sensors) => {

    let forwardSpeed = maxForwardSpeed;
    let angularSpeed = 0;

    let action = '';
    if (sensors.circles.left.reading.walls > 0 || sensors.circles.left.reading.robots > 0) {
      forwardSpeed = 0.5 * maxForwardSpeed;
      angularSpeed = maxAngularSpeed;
      action = 'right';
    } 
    if (sensors.circles.right.reading.walls > 0 || sensors.circles.right.reading.robots > 0) {
      forwardSpeed = 0.5 * maxForwardSpeed;
      angularSpeed = -maxAngularSpeed;
      action = 'left';
    } 

    console.log(sensors.circles.left.reading.walls + ", " + sensors.circles.right.reading.walls + ": " + action);



//    forwardSpeed = 0;
//    angularSpeed = 0;

    return {
      linearVel: forwardSpeed,
      angularVel: angularSpeed,
      type: robot.SPEED_TYPES.RELATIVE
    };
  };
}
