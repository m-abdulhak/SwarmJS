
/* depending on the value of parameter framesBetweenRuns, this effect function will run afte framesBetweenRuns loop of controller.js. 
 */
import Socket from '@common/utils/socket';

/* global variables */
var command = {};
var receivedFlag = [0];
var isInitilized = false;
var CONST = [{}]
var socket = null


export function fetchAngularCommand(id) { //! doesn't execute anything. only has access to memory calculated by python.
    if(receivedFlag[id] === 0){
        console.log("id",id,"waiting")
        // window.alert("oh")
        return 0;
    }
    receivedFlag[id] = 0;
    return command[id];
}

function initilizeRobots(scene) {
    if(isInitilized)// robots have been initilized before
        return null; 

    const SOCKET_URL = 'http://127.0.0.1:5000';
    socket = new Socket(SOCKET_URL); //! global
    socket.connect();
    socket.ping();
   
    
    isInitilized = true;

    command = new Array(scene.robots.length) //! global
    receivedFlag = new Array(scene.robots.length).fill(0) //! global

    CONST = new Array(scene.robots.length).fill({});
    for(let i = 0; i < CONST.length ; i++){
        
        let middleTau_ = scene.robots[i].controllers.velocity.params.tau || 0.6;
        let innie_ = scene.robots[i].color === 'yellow'? 1 : 0;
        let tau_ = innie_ ? middleTau_ + 0.05 : middleTau_ - 0.05;

        CONST[i] = {maxAngularSpeed : 0.015,
            maxForwardSpeed : 0.2,
            middleTau : middleTau_,
            innie : innie_,
            tau : tau_,
        }
    }

    /* socket callback function */
    socket.on('robot_speeds', (data) => {
        const speeds = Object.entries(data).reduce((acc, [k, v]) => {
            const strKey = `${k}`;
            acc[strKey] = v;
            return acc;
        }, {});
        let speedsList = Object.values(speeds)
        for(let i=0 ; i< speedsList.length ; i++){
            command[speedsList[i].id] = speedsList[i].angularSpeed //* double standard
            receivedFlag[speedsList[i].id] = 1;
        }
    });
}

function checkSensorAvailbility(fieldSensors){
    if (!fieldSensors.readings.heatMap.leftField
        || !fieldSensors.readings.heatMap.frontField
        || !fieldSensors.readings.heatMap.rightField) {
        console.log("sensors not readable")
        return 0;
    } else{
        return 1;
    }

}


export default function pythonBridger(scene) {
    initilizeRobots(scene);
    let allRobotSensors = new Array(scene.robots.length)

    for(let i = 0; i < allRobotSensors.length ; i++){
        if (!checkSensorAvailbility(scene.robots[i].sensorManager.activeSensors[6].value))
            return ;
        
        const leftField = scene.robots[i].sensorManager.activeSensors[6].value.readings.heatMap.leftField[0];
        const centreField = scene.robots[i].sensorManager.activeSensors[6].value.readings.heatMap.frontField[0];
        const rightField = scene.robots[i].sensorManager.activeSensors[6].value.readings.heatMap.rightField[0];
    
        // Positive integers (unbounded, but generally small)
        const leftPucks = scene.robots[i].sensorManager.activeSensors[7].value.left.reading.pucks;
        const rightPucks = scene.robots[i].sensorManager.activeSensors[7].value.right.reading.pucks;
    
        // We'll make these Boolean since the number shouldn't really change the response.
        const leftRobots = scene.robots[i].sensorManager.activeSensors[0].value.leftObstacle.reading.robots > 0;
        const leftWalls =  scene.robots[i].sensorManager.activeSensors[0].value.leftObstacle.reading.walls > 0;
    
        let pythonSensors = {
            id : i,
            leftField : leftField,
            centreField : centreField,
            rightField : rightField,
            leftPucks : leftPucks,
            rightPucks : rightPucks,
            leftRobots : leftRobots,
            leftWalls : leftWalls
            };

        let robotCONST = CONST[i]
        allRobotSensors[i] = {pythonSensors , robotCONST};
    }
    // console.log("will emit",allRobotSensors)
    socket.emit('get_robot_speeds', allRobotSensors);    
}
