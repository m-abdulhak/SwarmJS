/* eslint-disable no-eval */
export default function controller(robot, params, onLoop) {
  if (onLoop) {
    const func = eval(onLoop);

    if (func && typeof func === 'function') {
      return func;
    }
  }

  return (sensors) => {
    // console.log(sensors.fields.sensingPoints.forward);

    return {
      linearVel: 0,
      angularVel: 0,
      type: robot.SPEED_TYPES.RELATIVE
    };
  };
}
