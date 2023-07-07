
import Socket from '@common/utils/socket';

/* global variables */
const SOCKET_URL = 'http://127.0.0.1:5000';
var command = {};
var socket = new Socket(SOCKET_URL);
socket.connect();
socket.ping();
var isInitilized = false;
var CONST = [{}]

function initilizeRobots(scene) {
    if(isInitilized)// robots have been initilized before
        return; 
    
    isInitilized = true;

    command = new Array(scene.robots.length) //! global

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

    socket.on('robot_speeds', (data) => {
        const speeds = Object.entries(data).reduce((acc, [k, v]) => {
            const strKey = `${k}`;
            acc[strKey] = v;
            return acc;
        }, {});
        let speedsList = Object.values(speeds)
        for(let i=0 ; i< speedsList.length ; i++){
            scene.robots[speedsList[i].id].externalVelocity = {linearVel: CONST[speedsList[i].id].maxForwardSpeed ,
                    angularVel: speedsList[i].angularSpeed}
        }
        console.log("iVVVVVVVVV recieved command by python bridger", speedsList)
        scene.unpause();
        console.log("---------------------------unpaused")

    });
}


// const waitForData = async () => {
//     return new Promise(resolve => {
//     socket.on('robot_speeds', (data) => {
//         const speeds = Object.entries(data).reduce((acc, [k, v]) => {
//             const strKey = `${k}`;
//             acc[strKey] = v;
//             return acc;
//         }, {});
//         let speedsList = Object.values(speeds)
//         for(let i=0 ; i< speedsList.length ; i++){
//             scene.robots[speedsList[i].id].externalVelocity = {linearVel: CONST[speedsList[i].id].maxForwardSpeed ,
//                  angularVel: speedsList[i].angularSpeed}
//         }
//         console.log("iVVVVVVVVV recieved command by python bridger", speedsList)
//         debugger;
//         resolve();
//     });

//     });
//   };




// const delay = ms => new Promise(
//     resolve => setTimeout(resolve, ms)
//   );
  
export default async function pythonBridger(scene) {
    // debugger;
    // console.log('efeeeeeeeeeeeeeeeeeect')
    // scene.robots[0].externalVelocity = 'yay'
    // console.log(scene.robots[0].color)
    // scene.robots[0].color = "yellow";
    // debugger;

    scene.pause();
    console.log("+++++++++++++++++++++++++++++paused")

    initilizeRobots(scene);
    // debugger;
    let allRobotSensors = new Array(scene.robots.length)

    for(let i = 0; i < allRobotSensors.length ; i++){

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
    // debugger;
    console.log("will emit",allRobotSensors)
    socket.emit('get_robot_speeds', allRobotSensors);    

    // await waitForData();
    // scene.unpause();
    // console.log("--------------------unpaused")

}
