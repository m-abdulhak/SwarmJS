/* This is an example of a sensor that senses the location of the robot
   Sensors should implement the sensor interface:
   sample(): calculates the value of the sensor
   read(): returns the value of the sensor
   name: will be used to access the sensor throuh the sensor manager
   type: determines when the sensor is sampled, possible values: onStart, onUpdate, or onRequest.
   dependencies: optional, list of sensors that this sensor depends on.

    Sensors should be added to the availableSensors definitions in sensorManager

    Sensors can be implemented as either a class or a function
*/

import { sensorSamplingTypes, availableSensors } from './sensorManager';

// Class based sensor implementation
// export default class PositionSensor {
//   constructor(name, robot, scene) {
//     this.name = name;
//     this.type = sensorSamplingTypes.onUpdate;
//     this.dependencies = [availableSensors.prevPosition];

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
export default function PositionSensor(name, robot) {
  const type = sensorSamplingTypes.onUpdate;
  const dependencies = [availableSensors.prevPosition];

  // private
  const { body } = robot;
  let value = null;

  const sample = () => {
    value = { ...body.position };
  };

  const read = () => value;

  return {
    name,
    type,
    dependencies,
    sample,
    read
  };
}
