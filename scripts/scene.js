/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-console */
/* eslint-disable no-throw-literal */
/* eslint-disable no-loop-func */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
// eslint-disable-next-line no-unused-vars
class Scene {
  constructor(
    svg,
    numOfRobots,
    robotRadius,
    motionPlanningAlgorithm,
    enableRendering,
    startingPositionsConfig,
    pucksGroups,
    staticObjectsDefinitions,
  ) {
    this.svg = svg;
    this.width = parseInt(svg.attr('width'), 10);
    this.height = parseInt(svg.attr('height'), 10);
    this.environmentBounds = [
      [0, 0], [this.width, 0], [this.width, this.height], [0, this.height], [0, 0],
    ];
    this.numOfRobots = numOfRobots;
    this.robotRadius = robotRadius;
    this.pucksGroups = pucksGroups;
    this.numOfPucks = this.pucksGroups.reduce((total, puckGroup) => total + puckGroup.count, 0);

    // Create Matter.js Physics Engine
    this.engine = Engine.create();
    this.world = this.engine.world;
    this.world.gravity.y = 0;
    this.world.gravity.x = 0;

    // Add Environment Boundries To World
    this.addEnvBoundryObjects(this.width, this.height);

    // Add Static Obstacles To World
    this.staticObjects = staticObjectsDefinitions.map(
      (def) => generateStaticObject(def, this, true),
    );

    // Starting and Goal Positions
    this.robotsStartingPositions = this[startingPositionsConfig](
      this.numOfRobots,
      this.robotRadius,
      this.width,
      this.height,
      this.numOfPucks,
    );

    // Rendering option
    this.renderingEnabled = enableRendering;

    // Initialize Robots
    this.robots = this.initializeRobotsRange(
      this.numOfRobots,
      this.robotRadius,
      this.width,
      this.height,
      motionPlanningAlgorithm,
    );

    // Initialize Pucks
    this.pucks = this.initializePucksRange(
      this.pucksGroups,
      this.width,
      this.height,
    );
    this.maxNearbyPuckDistance = this.robotRadius * 10;

    // Initialize Voronoi Diagram
    this.voronoi = Delaunay
      .from(this.getCurRobotsPos(), (d) => d.x, (d) => d.y)
      .voronoi([0, 0, this.width, this.height]);

    // Initialize Renderer
    this.renderer = new Renderer(svg, this);

    // Simulation Speed
    this.timeDelta = 16.666;

    // Total Robot-Goal Distances
    this.distance = null;

    // Minimum Robot-Robot Distanc
    this.minDistance = null;

    this.mapArray = mapSceneToArr(this.width, this.height, this.staticObjects);

    // Distance Transform to obstacles
    // this.distanceTransformMap = distanceFromBooleanImage(this.mapArray, this.width, this.height, 'EDT');
    
    // drawMap(document.getElementById('mapCanvas'), this.mapArray, false);

    // Distance Transforms to Puck Goals, taking obstacles into consideration
    this.puckMaps = this.pucksGroups.map(
      (group) => ({
        id: group.id, 
        map: getDistanceTransformTo(this.mapArray, this.width / 4, this.height / 4, group.goal)
      })
    );

    console.log(this.puckMaps);

    // drawMap(document.getElementById('mapCanvas'), this.distanceTransformMap, true);
    drawMap(document.getElementById('mapCanvas'), this.puckMaps[0].map, true);
  }

  setSpeed(scale) {
    this.robots.forEach((r) => { r.velocityScale = scale; });
  }

  update(activeElements) {
    this.voronoi = Delaunay
      .from(gScene.getCurRobotsPos(), (d) => d.x, (d) => d.y)
      .voronoi([0, 0, this.width, this.height]);

    this.updateRobotsMeasurements();

    this.robots.forEach((r) => r.timeStep());
    this.pucks.forEach((p) => p.timeStep());

    gScene.updateMinRobotRobotDistMesurements();

    Engine.update(this.engine, this.timeDelta);

    timeInstance = this.engine.timing.timestamp;

    if (this.renderingEnabled) {
      this.renderer.update(activeElements);
    }

    this.updateDistance();

    Engine.clear(this.engine);
  }

  updateRobotsMeasurements() {
    // For each robot
    this.robots.forEach((r, i) => {
      // 1. Find Pucks within a certain distance to the robot
      r.nearbyPucks = this.pucks.filter(
        (p) => r.getDistanceTo(p.position) < this.maxNearbyPuckDistance,
      );

      // 2. Update the robot's neighbors
      r.neighbors = this.getNeighborsOf(i);

      // 3. Update the robot's cell
      const cell = this.voronoi.cellPolygon(i);
      r.VC = cell;

      r.trimVCwithStaticObstacles();

      // If cell is not defined => no need to update the BVC
      if (cell == null || cell === undefined || cell.length < 3) {
        return;
      }

      // 4. Update BVC
      r.BVC = this.calculateBVCfromVC(r.VC, r);
    });
  }

  calculateBVCfromVC(cell, r) {
    const offset = new Offset();
    let padding = [];

    try {
      padding = offset.data(cell).padding(r.radius * 1)[0];
    } catch (err) {
      // On collisions, if voronoi cell is too small => BVC is undefined
      // Should not occur in collision-free configurations
      // eslint-disable-next-line no-console
      console.log(err);
      padding = [[r.position.x, r.position.y]];
    }

    return padding;
  }

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

  updateDistance() {
    let dis = 0;

    this.robots.forEach((r) => {
      dis += r.getDistanceTo(r.goal) / 10;
    });

    this.distance = dis;
  }

  getCurRobotsPos() {
    return this.robots.map((r) => r.position);
  }

  getCurGoalsPos() {
    return this.robots.map((r) => r.goal);
  }

  initializeRobotsRange(numOfRobots, radius, envWidth, envHeight, motionPlanningAlgorithm) {
    return d3.range(numOfRobots)
      .map((i) => new Robot(i,
        this.getAnInitialPos(),
        this.getAnInitialPos(),
        radius,
        envWidth,
        envHeight,
        this,
        motionPlanningAlgorithm));
  }

  initializePucksRange(pucksGroups, envWidth, envHeight) {
    const pucks = [];
    let id = 0;

    pucksGroups.forEach((puckGroup) => {
      pucks.push(
        ...d3.range(puckGroup.count)
          .map((i) => new Puck(
            i + id,
            this.getAnInitialPos(),
            puckGroup.goal,
            puckGroup.radius,
            envWidth,
            envHeight,
            this,
            puckGroup.color,
          )),
      );

      id += puckGroup.count;
    });

    return pucks;
  }

  getAnInitialPos() {
    return this.robotsStartingPositions.pop();
  }

  getRandomCollisionFreePositions(numOfRobots, radius, envWidth, envHeight, numOfPucks) {
    const resolution = (radius * 2.1);
    const xCount = envWidth / resolution;
    const yCount = envHeight / resolution;
    const totalPositionsCount = parseInt(numOfRobots, 10) + parseInt(numOfPucks, 10);

    if (xCount * yCount < totalPositionsCount * 4) {
      throw 'Invalid inputs, number and size of robots and pucks are too high for this environment size!';
    }

    const positions = [];
    let i = 0;
    while (positions.length < totalPositionsCount * 3 && i < totalPositionsCount * 100) {
      const newX = Math.max(
        radius * 2,
        Math.min(envWidth - radius * 2, Math.floor(Math.random() * xCount) * resolution),
      );
      const newY = Math.max(
        radius * 2,
        Math.min(envHeight - radius * 2, Math.floor(Math.random() * yCount) * resolution),
      );
      const newPos = { x: newX, y: newY };

      if (positions.findIndex((x) => distanceBetween2Points(x, newPos) < radius * 2.5) === -1) {
        positions.push(newPos);
      }
      i += 1;
    }

    if (positions.length < totalPositionsCount * 2) {
      throw 'Invalid inputs, number and size of robots are too high for this environment size!';
    }

    return positions;
  }

  // getCircleCollisionFreePositions(numOfRobots, radius, envWidth, envHeight) {
  //   const circleRadius = (Math.min(envWidth, envHeight) * 20) / 42;
  //   const resolution = (Math.PI * 2) / numOfRobots;
  //   const envCenter = { x: envWidth / 2, y: envHeight / 2 };

  //   if (circleRadius * resolution < radius * 4) {
  //     throw 'Invalid inputs, number and size of robots are too high for this environment size!';
  //   }

  //   const positions = [];
  //   const start = Math.random() * Math.PI * 2;
  //   let i = start;
  //   while (i < start + Math.PI * 2) {
  //     const newX = envCenter.x + circleRadius * Math.cos(i);
  //     const newY = envCenter.y + circleRadius * Math.sin(i);
  //     const newGoalX = envCenter.x - circleRadius * Math.cos(i);
  //     const newGoalY = envCenter.y - circleRadius * Math.sin(i);
  //     const newPos = { x: newX, y: newY };
  //     const newGoalPos = { x: newGoalX, y: newGoalY };

  //     positions.push(newPos);
  //     positions.push(newGoalPos);

  //     i += resolution + (Math.random() * resolution) / 100 - resolution / 50;
  //   }

  //   if (positions.length < numOfRobots * 2) {
  //     throw 'Invalid inputs, number and size of robots are too high for this environment size!';
  //   }

  //   return positions;
  // }

  // getSquarePositionsConfig1(numOfRobots, radius, envWidth, envHeight) {
  //   const distanceBetweenPositions = radius * 4.2;
  //   return this.getSquareCollisionFreePositions(
  //     numOfRobots,
  //     radius,
  //     envWidth,
  //     envHeight,
  //     distanceBetweenPositions,
  //     false,
  //   );
  // }

  // getSquarePositionsConfig2(numOfRobots, radius, envWidth, envHeight) {
  //   const distanceBetweenPositions = radius * 4.6;
  //   return this.getSquareCollisionFreePositions(
  //     numOfRobots,
  //     radius,
  //     envWidth,
  //     envHeight,
  //     distanceBetweenPositions,
  //     true,
  //   );
  // }

  // getSquareCollisionFreePositions(
  //   numOfRobots,
  //   radius,
  //   envWidth,
  //   envHeight,
  //   distanceBetweenPositions,
  //   invertVertically,
  // ) {
  //   const resolution = distanceBetweenPositions;
  //   const robotStart = { x: radius * 10, y: radius * 20 };
  //   const goalsStart = {
  //     x: envWidth - radius * 10,
  //     y: !invertVertically ? radius * 20 : radius * 20 + resolution * 9,
  //   };

  //   const condEnVLengthTooSmall = robotStart.x + resolution * 10 > envWidth / 2;
  //   const condEnVHeightTooSmall = robotStart.y + resolution * 10 > envHeight;
  //   if (condEnVLengthTooSmall || condEnVHeightTooSmall) {
  //     throw 'Invalid inputs, number and size of robots are too high for this environment size!';
  //   }

  //   const positions = [];

  //   for (let row = 0; row < 10; row += 1) {
  //     for (let col = 0; col < 10; col += 1) {
  //       const newX = robotStart.x +
  //                    resolution * col + (Math.random() * radius) / 100 + radius / 50;
  //       const newY = robotStart.y +
  //                    resolution * row + (Math.random() * radius) / 100 + radius / 50;
  //       const newGoalX = goalsStart.x - resolution * col
  //       + (Math.random() * radius) / 100 + radius / 50;
  //       const newGoalY = !invertVertically
  //         ? goalsStart.y + resolution * row + (Math.random() * radius) / 100 + radius / 50
  //         : goalsStart.y - resolution * row + (Math.random() * radius) / 100 + radius / 50;

  //       const newPos = { x: newX, y: newY };
  //       const newGoalPos = { x: newGoalX, y: newGoalY };

  //       positions.push(newGoalPos);
  //       positions.push(newPos);
  //     }
  //   }

  //   if (positions.length < numOfRobots * 2) {
  //     throw 'Invalid inputs, number and size of robots are too high for this environment size!';
  //   }

  //   return positions;
  // }

  getNeighborsOf(robotIndex) {
    const neighbors = [];
    try {
      for (const neighborIndex of this.voronoi.delaunay.neighbors(robotIndex)) {
        neighbors.push(this.getRobotByIndex(neighborIndex));
      }
    } catch (error) {
      console.log(`Error Exracting Neighbors: ${error}`);
    }

    return neighbors;
  }

  getRobotByIndex(index) {
    return this.robots[index];
  }

  addEnvBoundryObjects(envWidth, envHeight) {
    World.add(this.world, [
      // walls
      Bodies.rectangle(
        envWidth / 2,
        -10,
        envWidth,
        20,
        { isStatic: true },
      ),
      Bodies.rectangle(
        envWidth / 2,
        envHeight + 10,
        envWidth,
        20,
        { isStatic: true },
      ),
      Bodies.rectangle(
        -10,
        envHeight / 2,
        20,
        envHeight,
        { isStatic: true },
      ),
      Bodies.rectangle(
        envWidth + 10,
        envHeight / 2,
        20,
        envHeight,
        { isStatic: true },
      ),
    ]);
  }

  // Initial Configurations
  static StartingPositions = {
    Random: "getRandomCollisionFreePositions",
    // Circle: "getCircleCollisionFreePositions",
    // InvertedSquare: "getSquarePositionsConfig1",
    // InvertedSquare2: "getSquarePositionsConfig2",
  };
}
