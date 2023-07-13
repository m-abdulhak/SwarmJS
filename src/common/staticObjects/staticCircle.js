import { World, Bodies } from 'matter-js';
import { getDistance, getLineCircleIntersectionPoint } from '../utils/geometry';

export default class StaticCircle {
  constructor(def, scene, shouldAddToWorld) {
    this.def = def;
    this.scene = scene;
    this.world = scene.world;

    // Circle Specific Properties
    this.center = this.def.center;
    this.radius = this.def.radius;
    this.points = [
      { x: this.center.x - (2 * this.radius) / 3, y: this.center.y + (2 * this.radius) / 3 },
      { x: this.center.x - this.radius, y: this.center.y },
      { x: this.center.x - (2 * this.radius) / 3, y: this.center.y - (2 * this.radius) / 3 },
      { x: this.center.x, y: this.center.y - this.radius },
      { x: this.center.x + (2 * this.radius) / 3, y: this.center.y - (2 * this.radius) / 3 },
      { x: this.center.x + this.radius, y: this.center.y },
      { x: this.center.x + (2 * this.radius) / 3, y: this.center.y + (2 * this.radius) / 3 },
      { x: this.center.x, y: this.center.y + this.radius }
    ];

    this.sides = [];
    for (let index = 0; index < this.points.length; index += 1) {
      const nextIndx = (index + 1) % this.points.length;
      this.sides.push([this.points[index], this.points[nextIndx]]);
    }

    this.body = Bodies.circle(this.center.x, this.center.y, this.radius, { isStatic: true });
    // this.body.collisionFilter = {
    //    group: 0,
    //    category: 0x0001,
    //    mask: 0x0001 | 0x0002,
    // };

    if (shouldAddToWorld) {
      this.addToWorld();
    }
  }

  // Static Obstacle Interface
  addToWorld() {
    World.add(
      this.world,
      this.body
    );
  }

  // Static Obstacles Interface
  getIntersectionPoint(point) {
    return getLineCircleIntersectionPoint(this.center, this.radius, point);
  }

  // Static Obstacle Interface
  pointIsReachableByRobot(point, robot) {
    return this.getDistanceToBorder(point) > robot.radius;
  }

  // Static Obstacle Interface
  containsPoint(point) {
    return getDistance(this.center, point) <= this.radius;
  }

  // Static Obstacle Interface
  getDistanceToBorder(point) {
    return this.getDistanceToCenter(point) - this.radius;
  }

  getDistanceToCenter(point) {
    return getDistance(this.center, point);
  }
}
