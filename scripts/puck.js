/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
// eslint-disable-next-line no-unused-vars
class Puck {
  constructor(id, position, goal, radius, envWidth, envHeight, scene, color) {
    this.id = id;
    this.position = position;
    this.prevPosition = position;
    this.velocityScale = 1;
    this.goal = goal;
    this.radius = radius;
    this.color = color;
    this.envWidth = envWidth;
    this.envHeight = envHeight;
    this.scene = scene;
    this.engine = this.scene.engine;
    this.world = this.scene.world;

    // Create Matter.js body and attach it to world
    this.body = Bodies.circle(position.x, position.y, this.radius);
    // this.body.friction = 0;
    this.body.frictionAir = 0.05;
    // this.body.frictionStatic = 0;
    // this.body.restitution = 0;
    World.add(this.world, this.body);

    // Initialize velocity according to movement goal
    this.velocity = { x: 0, y: 0 };
  }

  timeStep() {
    this.prevPosition = this.position;
    this.position = this.body.position;
    // this.updateVelocity();
    this.limitGoal();
  }

  reached(point) {
    const ret = this.getDistanceTo(point) <= this.radius / 50;
    return ret;
  }

  getDistanceTo(point) {
    const ret = distanceBetween2Points(this.position, point);
    return ret;
  }

  limitGoal() {
    const { radius } = this;
    this.goal = {
      x: Math.min(Math.max(radius, this.goal.x), this.envWidth - radius),
      y: Math.min(Math.max(radius, this.goal.y), this.envHeight - radius),
    };
  }
}
