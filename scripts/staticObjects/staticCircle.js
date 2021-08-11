/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
// eslint-disable-next-line no-unused-vars
class StaticCircle {
  constructor(def, scene, shouldAddToWorld) {
    this.def = def;
    this.scene = scene;
    this.world = scene.world;

    // Circle Spicific Properties
    this.center = this.def.center;
    this.radius = this.def.radius;

    this.body = Bodies.circle(this.center.x, this.center.y, this.radius, { isStatic: true });
    // this.body.collisionFilter = {
    //   group: 1,
    //   category: 1,
    //   mask: 1,
    // };

    if (shouldAddToWorld) {
      this.addToWorld();
    }
  }

  // Static Obstaccle Interface
  addToWorld() {
    World.add(
      this.world,
      this.body,
    );
  }

  // Static Obstaccle Interface
  pointIsReachableByRobot(point, robot) {
    return this.getDistanceToBorder(point) > robot.radius;
  }

  // Static Obstaccle Interface
  containsPoint(point) {
    return distanceBetween2Points(this.center, point) <= this.radius;
  }

  // Static Obstaccle Interface
  getDistanceToBorder(point) {
    return this.getDistanceToCenter(point) - this.radius;
  }

  getDistanceToCenter(point) {
    return distanceBetween2Points(this.center, point);
  }
}
