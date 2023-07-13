/*
  depending on the value of parameter framesBetweenRuns,
  this effect function will run after framesBetweenRuns loop of controller.js.
 */
import Socket from '@common/utils/socket';

// global Variables
let command = {};
let receivedFlag = [0];
let CONST = [{}];
let socket = null;
const logging = false;

export function fetchAngularCommand(id) { //! doesn't execute anything. only has access to memory calculated by python.
  if (receivedFlag[id] === 0) {
    if (logging) {
      // eslint-disable-next-line no-console
      console.log('id', id, 'waiting');
    }
    // window.alert("on")
    return 0;
  }
  receivedFlag[id] = 0;
  return command[id];
}

function initializeRobots(scene) {
  // robots have been initialized before
  if (scene.isInitialized) {
    return;
  }

  // eslint-disable-next-line no-param-reassign
  scene.isInitialized = true;
  const SOCKET_URL = 'http://127.0.0.1:5000';
  socket = new Socket(SOCKET_URL); //! global
  socket.connect();
  socket.ping();

  command = new Array(scene.robots.length); //! global
  receivedFlag = new Array(scene.robots.length).fill(0); //! global

  CONST = new Array(scene.robots.length).fill({});
  for (let i = 0; i < CONST.length; i += 1) {
    const middleTau = scene.robots[i].controllers.velocity.params.tau || 0.6;
    const innie = scene.robots[i].color === 'yellow' ? 1 : 0;
    const tau = innie ? middleTau + 0.05 : middleTau - 0.05;

    CONST[i] = {
      maxAngularSpeed: 0.015,
      maxForwardSpeed: 0.2,
      middleTau,
      innie,
      tau
    };
  }

  /* socket callback function */
  socket.on('robot_speeds', (data) => {
    const speeds = Object.entries(data).reduce((acc, [k, v]) => {
      const strKey = `${k}`;
      acc[strKey] = v;
      return acc;
    }, {});
    const speedsList = Object.values(speeds);
    for (let i = 0; i < speedsList.length; i += 1) {
      command[speedsList[i].id] = speedsList[i].angularSpeed; //* double standard
      receivedFlag[speedsList[i].id] = 1;
    }
  });
}

function checkSensorAvailability(fieldSensors) {
  if (!fieldSensors.readings.heatMap.leftField
        || !fieldSensors.readings.heatMap.frontField
        || !fieldSensors.readings.heatMap.rightField) {
    if (logging) {
      // eslint-disable-next-line no-console
      console.log('sensors not readable');
    }
    return 0;
  }
  return 1;
}

export default function pythonBridger(scene) {
  initializeRobots(scene);

  const allRobotSensors = new Array(scene.robots.length);

  for (let i = 0; i < allRobotSensors.length; i += 1) {
    if (!checkSensorAvailability(scene.robots[i].sensorManager.activeSensors[6].value)) { return; }

    const leftField = scene.robots[i].sensorManager.activeSensors[6].value.readings.heatMap.leftField[0];
    const centreField = scene.robots[i].sensorManager.activeSensors[6].value.readings.heatMap.frontField[0];
    const rightField = scene.robots[i].sensorManager.activeSensors[6].value.readings.heatMap.rightField[0];

    // Positive integers (unbounded, but generally small)
    const leftPucks = scene.robots[i].sensorManager.activeSensors[7].value.left.reading.pucks;
    const rightPucks = scene.robots[i].sensorManager.activeSensors[7].value.right.reading.pucks;

    // We'll make these Boolean since the number shouldn't really change the response.
    const leftRobots = scene.robots[i].sensorManager.activeSensors[0].value.leftObstacle.reading.robots > 0;
    const leftWalls = scene.robots[i].sensorManager.activeSensors[0].value.leftObstacle.reading.walls > 0;

    const pythonSensors = {
      id: i,
      leftField,
      centreField,
      rightField,
      leftPucks,
      rightPucks,
      leftRobots,
      leftWalls
    };

    const robotCONST = CONST[i];
    allRobotSensors[i] = { pythonSensors, robotCONST };
  }
  // console.log("will emit",allRobotSensors)
  socket.emit('get_robot_speeds', allRobotSensors);
}
