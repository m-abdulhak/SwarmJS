/* eslint-disable no-eval */
export default function controller(robot, params, onLoop) {
  // PARAMETERS:
  //
  // PASSING ALONG A PARAMETER THROUGH 'params' IS CURRENTLY BROKEN.
  //
  //const middleTau = params.tau;
  const middleTau = 0.6;
  const maxAngularSpeed = 0.015;
  const maxForwardSpeed = 0.2;

  // We'll define 25% of the robots as innies (pretty arbitrary)
  const innie = Math.random() < 0.25;
  const tau = innie ? middleTau + 0.05 : middleTau - 0.05;
  if (robot) {
    if (innie) {
      robot.color = 'yellow';
    } else {
      robot.color = 'cyan';
    }
  }

  if (onLoop) {
    const func = eval(onLoop);

    if (func && typeof func === 'function') {
      return func;
    }
  }

  return (sensors) => {

    function getAngularSpeed(sensors) {
      if (!sensors.fields.readings.heatMap.leftField
          || !sensors.fields.readings.heatMap.frontField
          || !sensors.fields.readings.heatMap.rightField) {
        return 0;
      }

      const l = (sensors.fields.readings.heatMap.leftField)[0] / 255;
      const c = (sensors.fields.readings.heatMap.frontField)[0] / 255;
      const r = (sensors.fields.readings.heatMap.rightField)[0] / 255;

      let leftPucks = sensors.polygons.left.reading.pucks;
      let rightPucks = sensors.polygons.right.reading.pucks;
      // console.log(`l: ${l.toPrecision(4)}, c: ${c.toPrecision(4)}, r: ${r.toPrecision(4)}`);
      // console.log(`leftPucks: ${leftPucks}, rightPucks: ${rightPucks}`);

      if (sensors.circles.leftObstacle.reading.robots > 0 || sensors.circles.leftObstacle.reading.walls > 0) {
          return maxAngularSpeed;
      }
      if (r >= c && c >= l) {
        if (innie && rightPucks > 0) {
          return maxAngularSpeed;
        } if (!innie && leftPucks > 0) {
          return -maxAngularSpeed;
        }

        if (c < tau) {
          return 0.3 * maxAngularSpeed;
        }
        return -0.3 * maxAngularSpeed;
      } if (c >= r && c >= l) {
        return -maxAngularSpeed;
      }
      return maxAngularSpeed;
    }

    let forwardSpeed = maxForwardSpeed;
    let angularSpeed = getAngularSpeed(sensors);

    return {
      linearVel: forwardSpeed * robot.velocityScale,
      angularVel: angularSpeed * robot.velocityScale,
      type: robot.SPEED_TYPES.RELATIVE
    };
  };
}