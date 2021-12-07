/* This is an example of a sensor that tracks the previous location of the robot
   Sensors should implement the sensor interface:
   sample(): calculates the value of the sensor
   read(): returns the value of the sensor
   name: will be used to access the sensor throuh the sensor manager
   type: determines when the sensor is sampled, possible values: onStart, onUpdate, or onRequest.
   dependencies:  specifies any other sensors needed for this sensor to work,
                  used sensorManager to determine the order in which the sensors are sampled
*/

import { sensorSamplingTypes } from './sensorManager';

// Function based sensor implementation
export default function PrevPositionSensor(name, robot) {
  const type = sensorSamplingTypes.onUpdate;
  const dependencies = [];

  // private
  let value = null;

  const sample = () => {
    value = { ...robot.sensorValues.position };
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
