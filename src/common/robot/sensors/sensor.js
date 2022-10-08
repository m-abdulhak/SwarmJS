export default class Sensor {
  constructor(robot, scene, name, samplingType) {
    this.robot = robot;
    this.scene = scene;
    this.name = name;
    this.type = samplingType;
    this.dependencies = [];
    this.value = null;
  }

  sample() {
    // Should be overridden by each sensor
    this.value = null;
  }

  read() {
    return this.value;
  }
}
