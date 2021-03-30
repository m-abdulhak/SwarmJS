/* eslint-disable no-console */
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
    this.body.frictionAir = 1;
    // this.body.frictionStatic = 0;
    // this.body.restitution = 0;
    World.add(this.world, this.body);

    // Initialize velocity according to movement goal
    this.velocity = { x: 0, y: 0 };

    //
    this.blockedDistance = this.radius * 1.5;
    this.goalReachedDist = this.radius * 10;
    this.deepInGoalDist = this.radius * 7;
  }

  timeStep() {
    this.prevPosition = this.position;
    this.position = this.body.position;
    console.log(`puck ${this.id} updated!`);
    this.limitGoal();
  }

  isBlocked() {
    let blocked = false;

    const closestPointToEnvBounds = closestPointInPolygonToPoint(
      this.scene.environmentBounds,
      this.position,
    );
    const distToEnvBounds = this.getDistanceTo(closestPointToEnvBounds);
    if (distToEnvBounds < this.blockedDistance * 2) {
      blocked = true;
    }

    for (let index = 0; !blocked && index < this.scene.staticObjects.length; index += 1) {
      const staticObj = this.scene.staticObjects[index];
      if (staticObj.getDistanceToBorder(this.position) < this.blockedDistance) {
        blocked = true;
      }
    }

    return blocked;
  }

  reachedGoal() {
    return this.reachedDist(this.goal, this.goalReachedDist);
  }

  deepInGoal() {
    return this.reachedDist(this.goal, this.deepInGoalDist);
  }

  reached(point) {
    const ret = this.getDistanceTo(point) <= this.radius * 10;
    return ret;
  }

  reachedDist(point, distance) {
    const ret = this.getDistanceTo(point) <= distance;
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

  generateStaticObjectDefinition() {
    return {
      type: 'circle',
      center: this.position,
      radius: this.radius,
    };
  }
}
