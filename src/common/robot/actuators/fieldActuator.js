/* eslint-disable no-param-reassign */
import Actuator from './actuator';
import { updateFieldAtPoint } from '../../utils/canvasUtils';

const name = 'field';

class FieldActuator extends Actuator {
  constructor(robot, scene) {
    super(robot, scene, name);
  }

  activate(field, values, coordinates = null) {
    if (!field.context) {
      return;
    }

    if (!coordinates) {
      coordinates = this.robot.sensors.position;
    }

    updateFieldAtPoint(field.context, coordinates, values);
  }
}

export default {
  name,
  Actuator: FieldActuator
};
