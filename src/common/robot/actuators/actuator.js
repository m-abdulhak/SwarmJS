/* eslint-disable class-methods-use-this */
export default class Actuator {
  constructor(robot, scene, name) {
    this.robot = robot;
    this.scene = scene;
    this.name = name;
    this.state = null;
  }

  activate() {
    // Should be overridden by each actuator, state should be set after activation
    throw new Error('Actuator.activate() not implemented');
  }

  deactivate() {
    // Should be overridden by each actuator, state should be set after deactivation
    throw new Error('Actuator.deactivate() not implemented');
  }

  getState() {
    return this.state;
  }
}
