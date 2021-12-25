/* eslint-disable no-console */
import { World, Constraint, Vector } from 'matter-js';
import Actuator from './actuator';

const name = 'grapper';

class GrapperActuator extends Actuator {
  constructor(robot, scene) {
    super(robot, scene, name);
    this.constraints = [];
  }

  activate() {
    if (!this.robot.sensors.closestPuckToGrapper) {
      console.log(`Failed to activate grapper, no puck found! robot: ${this.robot.id}`);
      return;
    }
    const puck = this.robot.sensors.closestPuckToGrapper;
    // Define the attachment point for the puck.
    const rawAttachmentPoint = { x: this.robot.radius + puck.radius, y: 0 };
    const attachmentPoint = Vector.rotate(rawAttachmentPoint, this.robot.body.angle);

    this.state = 'on';
    const constraint = Constraint.create({
      bodyA: this.robot.body,
      pointA: attachmentPoint,
      bodyB: puck.body,
      length: 0,
      stiffness: 0.3
    });
    puck.held = true;
    this.constraints.push({ constraint, puck });
    World.add(this.scene.world, constraint);
    console.log(`Activated grapper, robot: ${this.robot.id} puck: ${puck.id}`);
  }

  deactivate() {
    // Should be overridden by each sensor
    this.state = 'off';
    this.constraints.forEach((constraint) => {
      // eslint-disable-next-line no-param-reassign
      constraint.puck.held = false;
      World.remove(this.scene.world, constraint.constraint);
    });
    this.constraints = [];
  }

  getState() {
    return this.state;
  }
}

export default {
  name,
  Actuator: GrapperActuator
};
