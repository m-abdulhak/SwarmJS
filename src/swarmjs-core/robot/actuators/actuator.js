export default class Actuator {
  constructor(robot, scene, name) {
    this.robot = robot;
    this.scene = scene;
    this.name = name;
    this.state = 'off';
  }

  activate() {
    // Should be overridden by each sensor
    this.state = 'on';
  }

  deactivate() {
    // Should be overridden by each sensor
    this.state = 'off';
  }

  getState() {
    return this.state;
  }
}
