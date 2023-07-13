import { World, Bodies } from 'matter-js';

import { getDistance } from '../utils/geometry';

export default class StaticRectangle {
  constructor(def, scene, shouldAddToWorld) {
    this.def = def;
    this.scene = scene;
    this.world = scene.world;

    // Rectangle Specific Properties
    this.center = this.def.center;
    this.width = this.def.width;
    this.height = this.def.height;
    this.left = this.center.x - this.width / 2;
    this.top = this.center.y - this.height / 2;
    this.minMax = {
      minX: this.center.x - this.width / 2,
      maxX: this.center.x + this.width / 2,
      minY: this.center.y - this.height / 2,
      maxY: this.center.y + this.height / 2
    };
    this.points = [
      { x: this.minMax.minX, y: this.minMax.minY },
      { x: this.minMax.minX, y: this.minMax.maxY },
      { x: this.minMax.maxX, y: this.minMax.maxY },
      { x: this.minMax.maxX, y: this.minMax.minY }
    ];

    this.sides = [];
    for (let index = 0; index < this.points.length; index += 1) {
      const nextIndx = (index + 1) % this.points.length;
      this.sides.push([this.points[index], this.points[nextIndx]]);
    }

    this.body = Bodies.rectangle(
      this.center.x,
      this.center.y,
      this.width,
      this.height,
      { isStatic: true }
    );

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

  // Static Obstacle Interface
  getIntersectionPoint(point) {
    const insideOnX = point.x >= this.minMax.minX && point.x <= this.minMax.maxX;
    const insideOnY = point.y >= this.minMax.minY && point.y <= this.minMax.maxY;

    if (insideOnX && insideOnY) {
      return undefined;
    }

    if (insideOnX) {
      return {
        x: point.x,
        y: point.y >= this.minMax.maxY ? this.minMax.maxY : this.minMax.minY
      };
    }

    if (insideOnY) {
      return {
        x: point.x >= this.minMax.maxX ? this.minMax.maxX : this.minMax.minX,
        y: point.y
      };
    }

    return this.points
      .reduce((acc, p) => {
        if (acc == null) {
          return p;
        }

        const minDist = getDistance(acc, point);
        const curDist = getDistance(p, point);

        return curDist < minDist ? p : acc;
      });
  }

  // Static Obstacle Interface
  pointIsReachableByRobot(point, robot) {
    // console.log('pointIsReachableByRobot');
    // return true;
    const unreachable = this.minMax.maxX + robot.radius > point.x
      && this.minMax.minX - robot.radius < point.x
      && this.minMax.maxY + robot.radius > point.y
      && this.minMax.minY - robot.radius < point.y;
    return !unreachable;
  }

  // Static Obstacle Interface
  containsPoint(point) {
    // console.log('containsPoint');
    // return false;
    return point.x >= this.minMax.minX
    && point.x <= this.minMax.maxX
    && point.y >= this.minMax.minY
    && point.y <= this.minMax.maxY;
  }

  // Static Obstacle Interface
  getDistanceToBorder(point) {
    // console.log('getDistanceToBorder');
    // return 100000;
    const minDistOnX = Math.min(
      Math.abs(point.x - this.minMax.minX),
      Math.abs(point.x - this.minMax.maxX)
    );

    const minDistOnY = Math.min(
      Math.abs(point.y - this.minMax.minY),
      Math.abs(point.y - this.minMax.maxY)
    );

    const insideOnX = point.x >= this.minMax.minX && point.x <= this.minMax.maxX;
    const insideOnY = point.y >= this.minMax.minY && point.y <= this.minMax.maxY;

    if (insideOnX && insideOnY) {
      return Math.min(minDistOnX, minDistOnY);
    }

    if (insideOnX) {
      return minDistOnY;
    }

    if (insideOnY) {
      return minDistOnX;
    }

    return Math.sqrt(minDistOnX * minDistOnX + minDistOnY * minDistOnY);
  }
}
