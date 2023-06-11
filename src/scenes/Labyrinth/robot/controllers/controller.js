/* eslint-disable no-eval */
export default function controller(robot, params, onLoop) {
  // PARAMETERS:
  const maxAngularSpeed = 0.015;
  const maxForwardSpeed = 0.2;

  if (onLoop) {
    const func = eval(onLoop);

    if (func && typeof func === 'function') {
      return func;
    }
  }

  return (sensors) => {

    let command = { linearVel: 0, angularVel: 0, type: robot.SPEED_TYPES.RELATIVE };

    if (!sensors.fields.readings.heatMap.left
      || !sensors.fields.readings.heatMap.centreLeft
      || !sensors.fields.readings.heatMap.centreRight
      || !sensors.fields.readings.heatMap.right) {
      return command;
    }

    const l = (sensors.fields.readings.heatMap.left)[0] / 255;
    const cl = (sensors.fields.readings.heatMap.centreLeft)[0] / 255;
    const cr = (sensors.fields.readings.heatMap.centreRight)[0] / 255;
    const r = (sensors.fields.readings.heatMap.right)[0] / 255;

    //console.log("l, cl, cr, r: %g, %g, %g, %g", l, cl, cr, r);

    let angularSpeed = maxAngularSpeed * (r + cr - l - cl);
    //console.log("angularSpeed: %g", angularSpeed);

    command.linearVel = maxForwardSpeed * robot.velocityScale;
    command.angularVel = angularSpeed * robot.velocityScale;

    command.linearVel = 0;
    command.angularVel = 0;
    return command;
  };
}