// https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
function generateRandomNumberFromNormalDist() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return randn_bm() // resample between 0 and 1
    return num
  }

export default function beeClustVelocityController(robot, { angularVelocityScale }) {

  let waitTime = 0;

  return (point) => {
    // point is ignored.  This should not be a "Velocity Controller" that expects
    // a waypoint as input, but a "Reactive Controller" whose input is sensor
    // readings and whose output is a velocity in the robot's reference frame.
    // It shouldn't be possible (or, it shouldn't be easy) to access quantities
    // such as the robot's position.

    // Where should we define state variables for the controller?  Trying to
    // store them in the robot object here.  Bad idea?
    //if (!'waitTime' in robot) {
    //    robot['waitTime'] = 0;
    //}

    //
    // Constant parameters of the controller.  Where should they be defined?
    //

    // This should be a property of the sensor, not the controller.
    const sensingRadius = 40; 

    // Maximum time a robot should wait.
    const maxWaitTime = 100; 

    // Used as a constant within the function to determine wait time.
    const waitOffset = 2500;

    const sensors = robot.sensors;
    //console.log(sensors);

    // If the robot is not waiting, we move forward at a constant speed
    let forwardVel = 0.1 * robot.velocityScale; 

    //if (robot['waitTime'] > 0) {
    //    forwardVel = 0;
    //    --robot['waitTime'];
    //}
    if (waitTime > 0) {
        forwardVel = 0;
        --waitTime;
    }

    // Choose an angular velocity based on the normal distribution.  Override
    // it if there is a wall present.
    let angularVel = generateRandomNumberFromNormalDist() - 0.5;
    if (sensors.walls.includes("forwardLeft")) {
        angularVel = 0.1;
    }
    if (sensors.walls.includes("forwardRight")) {
        angularVel = -0.1;
    } // So if both left and right obstacles are present, the robot turns left.

    // LOCALLY-FAKED SENSOR 1: 
    // Determine how many robots are within the sensing radius.
    let count = 0;
    const sx = sensors.directions.forward.x;
    const sy = sensors.directions.forward.y;
    sensors.neighbors.forEach(function (item, index) {
        const rx = item.body.position.x;
        const ry = item.body.position.y;
        const distance = Math.hypot(sx - rx, sy - ry);
        if (distance <= sensingRadius) {
            ++count;
        }
    });

    // Only check the temperature in the presence of other robots.
    if (count > 0) {
        // LOCALLY-FAKED SENSOR 2: 
        // We need a temperature field to sense.  Assume temperature is equal to
        // 1000 - distance from the centre of the arena.
        const x = robot.body.position.x;
        const y = robot.body.position.y;
        const temperature = 1000 - Math.hypot(x - 400, y - 250);
        //robot.waitTime = Math.round(maxWaitTime * temperature**2 / (temperature**2 + waitOffset));
        waitTime = Math.round(maxWaitTime * temperature**2 / (temperature**2 + waitOffset));
    }

    // Translate the linear velocity from the robot's reference frame to the
    // global frame.
    let theta = robot.body.angle;
    let c = Math.cos(theta);
    let s = Math.sin(theta);

    const linearVel = { x: c*forwardVel, y: s*forwardVel };
    return { linearVel, angularVel };
  };
}
