import { World, Bodies, Body } from 'matter-js';
import { getDistance } from './utils/geometry';

export default class Puck {
  constructor(id, position, goal, radius, envWidth, envHeight, scene, color, map) {
    this.id = id;
    this.prevPosition = position;
    this.velocityScale = 1;
    this.groupGoal = { ...goal };
    this.goal = goal;
    this.radius = radius;
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
    this.body.frictionAir = 1;
    // this.body.frictionStatic = 0;
    // this.body.restitution = 0;
    // this.body.collisionFilter = {
    //   group: -1,
    //   category: 1,
    //   mask: 1,
    // };
    World.add(this.world, this.body);

    // Initialize velocity according to movement goal
    this.velocity = { x: 0, y: 0 };

    // Distances Configurations
    // this.blockedDistance = this.radius * 1.5;
    this.goalReachedDist = this.radius * 12;
    this.deepInGoalDist = this.radius * 8;
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
    if (this.reachedGoal()) {
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
}

export const PuckRenderables = [
  {
    type: 'goal',
    dataPoints: { sceneProp: 'pucksGroups' }, // property of scene
    shape: 'circle',
    staticAttrs: {
      r: {
        prop: 'radius',
        modifier: (val) => val * 12
      },
      fill: { prop: 'color' },
      cx: { prop: 'goal.x' },
      cy: { prop: 'goal.y' }
    },
    dynamicAttrs: {
    },
    styles: {
      'fill-opacity': 0.1,
      'stroke-opacity': 0.1
    }
  },
  {
    type: 'body',
    dataPoints: { sceneProp: 'pucks' }, // property of scene
    shape: 'circle',
    staticAttrs: {
      r: { prop: 'radius' },
      id: { prop: 'id' },
      fill: { prop: 'color' }
    },
    dynamicAttrs: {
      cx: { prop: 'position.x' },
      cy: { prop: 'position.y' }
    },
    styles: {
      stroke: 'black',
      'stroke-width': 1,
      'stroke-opacity': 1,
      'fill-opacity': 1
    },
    drag: {
      prop: 'position',
      pause: true,
      onStart: {
        styles: {
          stroke: 'lightgray'
        },
        log: [
          'sensors'
        ]
      },
      onEnd: {
        styles: {
          stroke: 'black'
        }
      }
    }
  }
];
