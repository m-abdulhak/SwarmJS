import GrabberActuator from './grabberActuator';
import FieldActuator from './fieldActuator';

const availableActuatorsDefinitions = [
  GrabberActuator,
  FieldActuator
];

// Actuators are stored in this object allowing other modules to easily reference them
// e.g. in config when defining the enabled sensors, or in other sensors to define a dependency
export const AvailableActuators = availableActuatorsDefinitions.reduce((acc, actDef) => {
  acc[actDef.name] = actDef;
  return acc;
}, {});

export default class ActuatorManager {
  constructor(scene, robot, enabledActuators) {
    this.scene = scene;
    this.robot = robot;

    this.activeActuators = enabledActuators.map(({ Actuator }) => new Actuator(robot, scene));
  }

  get actuators() {
    return this.activeActuators.reduce((acc, a) => ({
      ...acc,
      [a.name]: a
    }), {});
  }
}
