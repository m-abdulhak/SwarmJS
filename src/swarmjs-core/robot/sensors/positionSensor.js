/* This is an example of a sensor that senses the location of the robot
   Sensors should implement the sensor interface:
   sample(): calculates the value of the sensor
   read(): returns the value of the sensor
   name: will be used to access the sensor throuh the sensor manager
   type: determines when the sensor is sampled, possible values: onStart, onUpdate, or onRequest.

    Sensors should be added to the sensor manager's list of sensors to be available for use

    Sensors can be implemented as either a class or a function
*/

import { sensorSamplingTypes } from './sensorManager';

// Class based sensor implementation
// export default class PositionSensor {
//   constructor(scene, robot) {
//     this.name = 'position';
//     this.type = sensorSamplingTypes.onUpdate;

//     // private
//     this.body = robot.body;
//     this.value = null;
//   }

//   sample() {
//     this.value = this.body.position;
//   }

//   read() {
//     return this.value;
//   }
// }

// Function based sensor implementation
export default function PositionSensor(scene, robot) {
  const name = 'position';
  const type = sensorSamplingTypes.onUpdate;

  // private
  const { body } = robot;
  let value = null;

  const sample = () => {
    value = body.position;
  };

  const read = () => value;

  return {
    name,
    type,
    sample,
    read
  };
}
