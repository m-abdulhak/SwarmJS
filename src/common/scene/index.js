/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
import * as d3 from 'd3';
import { Engine, World } from 'matter-js';
import { Delaunay } from 'd3-delaunay';

import Robot from '../robot/robot';
import Puck from '../puck';
import generateStaticObject from '../staticObjects/staticObjectFactory';
import { mapSceneToArr, getPucksGoalMap } from '../distanceTransform/globalPlanning';
import { getEnvBoundaryObjects } from '../utils/matter';
import Socket from '../utils/socket';

const defaultExtEngineUpdateInterval = 100;

export default class Scene {
  constructor(
    envConfig,
    robotsConfig,
    pucksConfigs,
    staticObjectsDefinitions,
    algorithm,
    positionsGenerator,
    gMaps
  ) {
    Window.Scene = this;

    if (envConfig?.externalEngine?.url) {
      this.externalEngine = true;
      this.socket = new Socket(envConfig?.externalEngine?.url);
      this.socket.connect();
      this.socket.ping();

      this.externalRobotPositions = {};

      // Add callback to store robot positions received by external engine
      this.socket.on('robot_positions', (data) => {
        this.externalRobotPositions = data;
      });

      // Limit updates to external engine to once every 100ms (default)
      this.externalEngineUpdateInterval = envConfig?.externalEngine?.updateInterval ?? defaultExtEngineUpdateInterval;
      this.lastExternalEngineUpdate = 0;
    }

    this.numOfRobots = robotsConfig.count;
    this.robotRadius = robotsConfig.radius;
    this.useVoronoi = robotsConfig.useVoronoiDiagram;
    this.pucksGroups = pucksConfigs.groups;
    this.numOfPucks = this.pucksGroups.reduce((total, puckGroup) => total + puckGroup.count, 0);

    this.width = parseInt(envConfig.width, 10);
    this.height = parseInt(envConfig.height, 10);
    this.background = envConfig.background || null;
    this.fields = envConfig.fields;

    // Create Matter.js Physics Engine
    this.engine = Engine.create();
    this.world = this.engine.world;
    this.engine.gravity.y = 0;
    this.engine.gravity.x = 0;
    this.timeInstance = 0;
    this.engine.positionIterations = 10;
    this.engine.velocityIterations = 10;

    // Add Environment Boundries To World
    this.envBoundaryObjects = getEnvBoundaryObjects(this.width, this.height);
    World.add(this.world, this.envBoundaryObjects);

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
      robotsConfig.controllers,
      robotsConfig.sensors,
      robotsConfig.actuators,
      this.width,
      this.height,
      robotsConfig.misc
    );

    this.puckMaps = [];
    this.mapArray = [];
    // Generate Binary Scene Map
    const mapKey = `${this.width}-${this.height}-${JSON.stringify(staticObjectsDefinitions || [])}`;
    if (pucksConfigs.useGlobalPuckMaps) {
      if (gMaps.mapArray) {
        this.mapArray = gMaps.mapArray;
      } else {
        const storedMap = localStorage.getItem(mapKey);
        if (storedMap) {
          this.mapArray = JSON.parse(storedMap);
        } else {
          this.mapArray = mapSceneToArr(this.width, this.height, this.staticObjects);
          localStorage.setItem(mapKey, JSON.stringify(this.mapArray));
        }
        gMaps.mapArray = this.mapArray;
      }

      // Distance Transforms to Puck Goals, taking obstacles into consideration
      this.puckMapScale = 1 / 4;
      if (gMaps.puckMaps) {
        this.puckMaps = gMaps.puckMaps;
      } else {
        this.puckMaps = this.pucksGroups.map(
          (group) => {
            const puckMapKey = `${mapKey}-${group.goal.x}-${group.goal.y}`;
            const storedMap = localStorage.getItem(puckMapKey);
            if (storedMap) {
              return JSON.parse(storedMap);
            }
            const newMap = getPucksGoalMap(
              this.mapArray,
              Math.floor(this.width * this.puckMapScale),
              Math.floor(this.height * this.puckMapScale),
              {
                x: Math.floor(group.goal.x * this.puckMapScale),
                y: Math.floor(group.goal.y * this.puckMapScale)
              },
              this.puckMapScale
            );
            localStorage.setItem(puckMapKey, JSON.stringify(newMap));

            return newMap;
          }
        );

        gMaps.puckMaps = this.puckMaps;
      }
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
    this.voronoi = !this.useVoronoi ? null : Delaunay
      .from(this.getCurRobotsPos(), (d) => d.x, (d) => d.y)
      .voronoi([0, 0, this.width, this.height]);

    // Simulation Speed
    this.timeDelta = 16.666;

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
      if (!scale || typeof scale !== 'number' || scale <= 0) {
        return;
      }
      this.robots.forEach((r) => { r.velocityScale = scale; });
    };

    this.togglePause.bind(this);
    this.pause.bind(this);
    this.unpause.bind(this);
    this.setSpeed.bind(this);

    this.setSpeed(envConfig.speed);
  }

  update() {
    if (this.externalEngine && this.externalRobotPositions) {
      for (const r of this.robots) {
        if (
          this.externalRobotPositions[r.id]?.x != null
          && this.externalRobotPositions[r.id]?.y != null
        ) {
          r.position = this.externalRobotPositions[r.id] ?? r.position;
        }
      }
    }

    Engine.update(this.engine, this.timeDelta);

    if (this.useVoronoi) {
      this.voronoi = Delaunay
        .from(this.getCurRobotsPos(), (d) => d.x, (d) => d.y)
        .voronoi([0, 0, this.width, this.height]);
    }

    this.robots.forEach((r) => r.timeStep());
    this.pucks.forEach((p) => p.timeStep());

    if (this.externalEngine) {
      const goalsMsg = {};

      for (const r of this.robots) {
        goalsMsg[r.id] = {
          goal: r.goal,
          waypoint: r.waypoint
        };
      }

      const now = Date.now();
      const shouldUpdateGoals = !this.externalEngineUpdateInterval
        || now - this.lastExternalEngineUpdate >= this.externalEngineUpdateInterval;
      if (shouldUpdateGoals) {
        this.socket.emit('set_goals', goalsMsg);
        this.lastExternalEngineUpdate = now;
      }
    }

    this.timeInstance = this.engine.timing.timestamp;

    Engine.clear(this.engine);
  }

  get voronoiMesh() {
    return this.useVoronoi ? this.voronoi.render() : '';
  }

  getCurRobotsPos() {
    return this.robots.map((r) => r.sensors.position);
  }

  getCurGoalsPos() {
    return this.robots.map((r) => r.goal);
  }

  initializeRobotsRange(
    numOfRobots,
    radius,
    controllers,
    sensors,
    actuators,
    envWidth,
    envHeight,
    misc
  ) {
    return d3.range(numOfRobots)
      .map((i) => new Robot(
        i,
        this.getPos(),
        this.getPos(),
        controllers,
        sensors,
        actuators,
        radius,
        envWidth,
        envHeight,
        this,
        misc,
        this.externalEngine
      ));
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
            puckGroup.radius,
            puckGroup.goal,
            puckGroup.goalRadius,
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
}
