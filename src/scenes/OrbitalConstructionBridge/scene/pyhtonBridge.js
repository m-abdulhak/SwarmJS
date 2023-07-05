
import Socket from '@common/utils/socket';

const SOCKET_URL = 'http://127.0.0.1:5000';
var command = {};
var receivedFlag = [0];
var socket = new Socket(SOCKET_URL);
socket.connect();
socket.ping();



socket.on('robot_speeds', (data) => {
    const speeds = Object.entries(data).reduce((acc, [k, v]) => {
        const strKey = `${k}`;
        acc[strKey] = v;
        return acc;
    }, {});

    command[speeds.id] = speeds.angularSpeed
    receivedFlag[speeds.id] = 1;
    console.log("VVVVVVVVV recieved command by python bridger", speeds , data,receivedFlag)

});


export function fetchAngularCommand(id) {
    // console.log("fetch request form",id)
    // while(receivedFlag[id] === 0){
    //     console.log("id",id,"waiting")
    // }

    if(receivedFlag[id] === 0){
        console.log("id",id,"waiting")
        return 0;
    }


    receivedFlag[id] = 0;
    return command[id];
}

export default function pyhtonBridger(scene) {
    // console.log("-----------------------------I AM pyhtonBridge",)
    
    //! duplicate code ----  can do better. also executing at each loop
    const CONST = {}  
    CONST.maxAngularSpeed = 0.015;
    CONST.maxForwardSpeed = 0.2;


    let allRobotSensors = new Array(scene.robots.length)
    command = new Array(scene.robots.length) //! global
    receivedFlag = new Array(scene.robots.length).fill(0) //! global

    
    for(let i = 0; i < allRobotSensors.length ; i++){
        CONST.middleTau = scene.robots[i].controllers.velocity.params.tau || 0.6; 
        CONST.innie = scene.robots[i].color === 'yellow'? 1 : 0; //! PROBLEM inconsistent with robots themselves
        CONST.tau = CONST.innie ? CONST.middleTau + 0.05 : CONST.middleTau - 0.05;
    
        const leftField = scene.robots[i].sensorManager.activeSensors[6].value.readings.heatMap.leftField[0];
        const centreField = scene.robots[i].sensorManager.activeSensors[6].value.readings.heatMap.frontField[0];
        const rightField = scene.robots[i].sensorManager.activeSensors[6].value.readings.heatMap.rightField[0];
    
        // Positive integers (unbounded, but generally small)
        const leftPucks = scene.robots[i].sensorManager.activeSensors[7].value.left.reading.pucks;
        const rightPucks = scene.robots[i].sensorManager.activeSensors[7].value.right.reading.pucks;
    
        // We'll make these Boolean since the number shouldn't really change the response.
        const leftRobots = scene.robots[i].sensorManager.activeSensors[0].value.leftObstacle.reading.robots > 0;
        const leftWalls =  scene.robots[i].sensorManager.activeSensors[0].value.leftObstacle.reading.walls > 0;
        // VAR.socket.emit('custom_message' , leftWalls);
    
    
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

        allRobotSensors[i] = pythonSensors

        socket.emit('get_robot_speeds', {pythonSensors , CONST});    
    }

}
