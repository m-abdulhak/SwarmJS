/* eslint-disable no-param-reassign */
import * as d3 from 'd3';
import { Engine, World, Bodies } from 'matter-js';
import { Delaunay } from 'd3-delaunay';

import Robot from './robot/robot';
import Puck from './puck';
import generateStaticObject from './staticObjects/staticObjectFactory';
import { mapSceneToArr, getPucksGoalMap } from './distanceTransform/globalPlanning';

export default class Scene {
  constructor(
    envConfig,
    robotsConfig,
    pucksGroups,
    staticObjectsDefinitions,
    algorithm,
    positionsGenerator,
    gMaps
  ) {
    this.numOfRobots = robotsConfig.count;
    this.robotRadius = robotsConfig.radius;
    this.pucksGroups = pucksGroups;
    this.numOfPucks = this.pucksGroups.reduce((total, puckGroup) => total + puckGroup.count, 0);

    this.width = parseInt(envConfig.width, 10);
    this.height = parseInt(envConfig.height, 10);

    // Create Matter.js Physics Engine
    this.engine = Engine.create();
    this.world = this.engine.world;
    this.engine.gravity.y = 0;
    this.engine.gravity.x = 0;
    this.timeInstance = 0;
    this.engine.positionIterations = 10;
    this.engine.velocityIterations = 10;

    // Add Environment Boundries To World
    this.addEnvBoundryObjects(this.width, this.height);

    // Add Static Obstacles To World
    this.staticObjects = staticObjectsDefinitions.map(
      (def) => generateStaticObject(def, this, true)
    );

    // Starting and Goal Positions
    this.getPos = positionsGenerator(
      this.numOfRobots + this.numOfPucks,
      this.robotRadius,
      this.width,
      this.height,
      this.staticObjects
    );

    // Initialize Robots
    this.robots = this.initializeRobotsRange(
      this.numOfRobots,
      this.robotRadius,
      robotsConfig.sensors,
      robotsConfig.actuators,
      this.width,
      this.height,
      algorithm
    );

    // Generate Binary Scene Map
    if (gMaps.mapArray) {
      this.mapArray = gMaps.mapArray;
    } else {
      this.mapArray = mapSceneToArr(this.width, this.height, this.staticObjects);
      gMaps.mapArray = this.mapArray;
    }

    // Distance Transforms to Puck Goals, taking obstacles into consideration
    this.puckMapScale = 1 / 4;
    if (gMaps.puckMaps) {
      this.puckMaps = gMaps.puckMaps;
    } else {
      this.puckMaps = this.pucksGroups.map(
        (group) => (getPucksGoalMap(
          this.mapArray,
          Math.floor(this.width * this.puckMapScale),
          Math.floor(this.height * this.puckMapScale),
          {
            x: Math.floor(group.goal.x * this.puckMapScale),
            y: Math.floor(group.goal.y * this.puckMapScale)
          },
          this.puckMapScale
        )
        )
      );

      gMaps.puckMaps = this.puckMaps;
    }
    // drawMap(document.getElementById('mapCanvas'), this.distanceTransformMap, true);
    // drawMap(document.getElementById('mapCanvas'), this.puckMaps[2], this.puckMapScale, true);

    // Initialize Pucks
    this.pucks = this.initializePucksRange(
      this.pucksGroups,
      this.width,
      this.height,
      this.puckMaps
    );

    // Initialize Voronoi Diagram
    this.voronoi = Delaunay
      .from(this.getCurRobotsPos(), (d) => d.x, (d) => d.y)
      .voronoi([0, 0, this.width, this.height]);

    // Simulation Speed
    this.timeDelta = 16.666;

    // Benchmark Data :
    // Minimum Robot-Robot Distanc
    this.minDistance = null;
    // Total Puck-Goal Distances
    this.distance = null;
    // Pucks Outside Goal Count;
    this.pucksOutsideGoalCount = null;

    // Change Options Based on algorithm
    this.availableAlgorithms = [
      {
        name: 'Proposed Algorithm',
        testEnabled: true
      },
      {
        name: 'Baseline Algorithm',
        testEnabled: false
      }
    ];
    this.algorithmOptions = algorithm
      ? this.availableAlgorithms.find((a) => a.name === algorithm)
      : this.availableAlgorithms[0];

    this.paused = false;

    this.togglePause = () => {
      this.paused = !this.paused;
    };

    this.pause = () => {
      this.paused = true;
    };

    this.unpause = () => {
      this.paused = false;
    };

    this.setSpeed = (scale) => {
      this.robots.forEach((r) => { r.velocityScale = scale; });
    };

    this.changeAlgorithm = (newAlgorithm) => {
      this.algorithmOptions = this.availableAlgorithms.find((a) => a.name === newAlgorithm);
      this.robots.forEach((r) => { r.changeAlgorithm(newAlgorithm); });
    };

    this.togglePause.bind(this);
    this.pause.bind(this);
    this.unpause.bind(this);
    this.setSpeed.bind(this);
    this.changeAlgorithm.bind(this);
  }

  update() {
    Engine.update(this.engine, this.timeDelta);

    this.voronoi = Delaunay
      .from(this.getCurRobotsPos(), (d) => d.x, (d) => d.y)
      .voronoi([0, 0, this.width, this.height]);

    this.robots.forEach((r) => r.timeStep());
    this.pucks.forEach((p) => p.timeStep());

    this.updatePucksOutsideOfGoalMesurements();
    // this.updateMinRobotRobotDistMesurements();

    this.timeInstance = this.engine.timing.timestamp;

    this.updateDistance();

    Engine.clear(this.engine);
  }

  get voronoiMesh() {
    return this.voronoi.render();
  }

  // TODO: Move to benchmark module
  updateMinRobotRobotDistMesurements() {
    let minDist = null;

    this.robots.forEach((r, i) => {
      const distMeasurements = r.getNeighborRobotsDistanceMeasurements(this.robots.slice(i + 1), 0);

      if (minDist == null || distMeasurements.minDist < minDist) {
        minDist = distMeasurements.minDistance;
      }
    });

    if (this.minDistance == null || minDist < this.minDistance) {
      this.minDistance = minDist;
    }
  }

  // TODO: Move to benchmarking module
  updatePucksOutsideOfGoalMesurements() {
    // Calculate the number of pucks outside of their goal area
    const pucksOutsideGoalCount = this.pucks
      .map((p) => p.reachedGoal())
      .reduce((acc, cur) => acc + (cur ? 0 : 1), 0);
    this.pucksOutsideGoalCount = pucksOutsideGoalCount;
  }

  // TODO: Move to benchmarking module
  updateDistance() {
    let dis = 0;

    this.pucks.forEach((p) => {
      const distToGoal = p.getDistanceTo(p.groupGoal);
      dis += distToGoal > p.goalReachedDist ? (distToGoal - p.goalReachedDist) / 100 : 0;
    });

    this.distance = dis;
  }

  getCurRobotsPos() {
    return this.robots.map((r) => r.sensors.position);
  }

  getCurGoalsPos() {
    return this.robots.map((r) => r.goal);
  }

  initializeRobotsRange(numOfRobots, radius, sensors, actuators, envWidth, envHeight, algorithm) {
    return d3.range(numOfRobots)
      .map((i) => new Robot(i,
        this.getPos(),
        this.getPos(),
        sensors,
        actuators,
        radius,
        envWidth,
        envHeight,
        this,
        algorithm));
  }

  initializePucksRange(pucksGroups, envWidth, envHeight, maps) {
    const pucks = [];
    let id = 0;

    pucksGroups.forEach((puckGroup) => {
      pucks.push(
        ...d3.range(puckGroup.count)
          .map((i) => new Puck(
            i + id,
            this.getPos(),
            puckGroup.goal,
            puckGroup.radius,
            envWidth,
            envHeight,
            this,
            puckGroup.color,
            maps[puckGroup.id]
          ))
      );

      id += puckGroup.count;
    });

    return pucks;
  }

  addEnvBoundryObjects(envWidth, envHeight) {
    World.add(this.world, [
      // walls
      Bodies.rectangle(
        envWidth / 2,
        -10,
        envWidth,
        20,
        { isStatic: true }
      ),
      Bodies.rectangle(
        envWidth / 2,
        envHeight + 10,
        envWidth,
        20,
        { isStatic: true }
      ),
      Bodies.rectangle(
        -10,
        envHeight / 2,
        20,
        envHeight,
        { isStatic: true }
      ),
      Bodies.rectangle(
        envWidth + 10,
        envHeight / 2,
        20,
        envHeight,
        { isStatic: true }
      )
    ]);
  }
}

export const SceneRenderables = [
  {
    type: 'Obstacles',
    dataPoints: {
      sceneProp: 'staticObjects',
      modifier: (list) => list.filter((o) => o.def.type === 'rectangle')
    }, // property of scene
    shape: 'rect',
    staticAttrs: {
      x: { prop: 'left' },
      y: { prop: 'top' },
      width: { prop: 'width' },
      height: { prop: 'height' }
    },
    styles: {
      fill: '#000000'
    }
  },
  {
    type: 'Obstacles',
    dataPoints: {
      sceneProp: 'staticObjects',
      modifier: (list) => list.filter((o) => o.def.type === 'circle')
    }, // property of scene
    shape: 'circle',
    staticAttrs: {
      cx: { prop: 'center.x' },
      cy: { prop: 'center.y' },
      r: { prop: 'radius' }
    },
    styles: {
      fill: '#000000'
    }
  }
];
