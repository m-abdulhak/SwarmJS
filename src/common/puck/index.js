import { World, Bodies, Body } from 'matter-js';
import { getDistance } from '../utils/geometry';

export default class Puck {
  constructor(id, position, radius, goal, goalRadius, envWidth, envHeight, scene, color, map, groupId) {
    this.id = id;
    this.group = groupId;
    this.prevPosition = position;
    this.velocityScale = 1;
    this.groupGoal = { ...goal };
    this.goal = goal;
    this.radius = radius;
    this.goalRadius = goalRadius;
    this.color = color;
    this.envWidth = envWidth;
    this.envHeight = envHeight;
    this.scene = scene;
    this.engine = this.scene.engine;
    this.world = this.scene.world;
    this.map = map;

    // Create Matter.js body and attach it to world
    this.body = Bodies.circle(position.x, position.y, this.radius);
    // this.body.friction = 0;
    this.body.frictionAir = 0.5;
    // this.body.frictionStatic = 0;
    // this.body.restitution = 0;
    // Body.setDensity(this.body, 0.001);

    // this.body.collisionFilter = {
    //    group: 0,
    //    category: 0x0002,
    //    mask: 0x0001 | 0x0002 | 0x0004,
    // };
    World.add(this.world, this.body);

    // Initialize velocity according to movement goal
    this.velocity = { x: 0, y: 0 };

    // Distances Configurations
    // this.blockedDistance = this.radius * 1.5;
    this.goalReachedDist = this.goalRadius;
    this.deepInGoalDist = 2 * (this.goalRadius / 3);
  }

  get position() {
    return {
      x: this.body.position.x,
      y: this.body.position.y
    };
  }

  set position(val) {
    Body.set(this.body, 'position', { x: val?.x || null, y: val?.y || null });
  }

  timeStep() {
    this.prevPosition = this.position;
    this.position = this.body?.position;
    this.updateGoal();
    this.limitGoal();
  }

  updateGoal() {
    if (this.reachedGoal() || !this.map) {
      this.goal = this.groupGoal;
    } else {
      const mapY = Math.min(this.map.length, Math.max(0, Math.floor(this.position.y / 4)));
      const mapX = Math.min(this.map[0].length, Math.max(0, Math.floor(this.position.x / 4)));
      const dir = this.map != null && this.map[mapY] != null && this.map[mapY][mapX] != null
        ? this.map[mapY][mapX]
        : [1, 1];
      this.goal = {
        x: this.position.x + dir[0] * this.radius * 10,
        y: this.position.y + dir[1] * this.radius * 10
      };
    }
  }

  reachedGoal() {
    return this.reachedDist(this.groupGoal, this.goalReachedDist);
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
    const ret = getDistance(this.position, point);
    return ret;
  }

  limitGoal() {
    const { radius } = this;
    this.goal = {
      x: Math.min(Math.max(radius, this.goal.x), this.envWidth - radius),
      y: Math.min(Math.max(radius, this.goal.y), this.envHeight - radius)
    };
  }

  generateStaticObjectDefinition() {
    return {
      type: 'circle',
      center: this.position,
      radius: this.radius,
      skipOrbit: true,
      fromPuck: true
    };
  }

  destroy() {
    World.remove(this.world, this.body);
  }
}
