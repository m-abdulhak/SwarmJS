class Scene{
  // Initial Configurations
  static StartingPositions = {
    Random: "getRandomCollisionFreePositions",
    Circle: "getCircleCollisionFreePositions",
    InvertedSquare: "getSquarePositionsConfig1",
    InvertedSquare2: "getSquarePositionsConfig2",
  }

  constructor(svg, numOfRobots, robotRadius, motionPlanningAlgorithm, enableRendering, startingPositionsConfig){
    this.svg = svg;
    this.width = svg.attr("width");
    this.height = svg.attr("height");
    this.numOfRobots = numOfRobots;
    this.radius = robotRadius;
       
    // Starting and Goal Positions
    this.robotsStartingPositions = this[startingPositionsConfig](this.numOfRobots, this.radius, this.width, this.height);

    // Rendering option
    this.renderingEnabled = enableRendering;

    // Collision instances
    this.collisions = [];

    // Initialize Robots
    this.robots = this.initializeRobotsRange(this.numOfRobots, this.radius, this.width, this.height, motionPlanningAlgorithm);

    // Initialize Voronoi Diagram
    this.voronoi = Delaunay
      .from(this.getCurRobotsPos(), d => d.x, d => d.y)
      .voronoi([0, 0, this.width, this.height]);
    
    // Initialize Renderer
    this.renderer = new Renderer(svg, this);

    // Simulation Speed
    this.timeDelta = 0.1;

    // Collision Detection
    this.uniqueCollisions = [];
    this.totalCollisionTimeInst = 0;

    // Total Robot-Goal Distances
    this.distance = null;

    // Minimum Robot-Robot Distanc
    this.minDistance = null;
  }

  setTimeScale(scale){
    this.timeDelta = scale/10;
  }

  update(activeElements){
    // TODO: find alternative to using global gScene here instead of "this"
    // Using "this" is causing errors when update() is being called from svg on drag and drop oprations
    gScene.voronoi = Delaunay
    .from(gScene.getCurRobotsPos(), d => d.x, d => d.y)
    .voronoi([0, 0, gScene.width, gScene.height]);

    gScene.updateRobotsMeasurements();

    gScene.robots.forEach(r => r.timeStep(gScene.timeDelta));

    gScene.checkCollision();

    if(this.renderingEnabled){
      gScene.renderer.update(activeElements);
    }

    gScene.updateDistance();
  }

  updateRobotsMeasurements(){
    this.robots.forEach((r,i) => {
      r.neighbors = this.getNeighborsOf(i);

      let cell = this.voronoi.cellPolygon(i);
      r.VC = cell;

      if(cell == null || cell == undefined || cell.length < 3){
        return;
      }
      
      r.BVC = this.calculateBVCfromVC(cell, r);
    })
  }

  calculateBVCfromVC(cell, r){
    var offset = new Offset();
    var padding = [];
    
    try {
      padding = offset.data(cell).padding(r.radius*1)[0]
    }
    catch(err) {
      // On collisions, if voronoi cell is too small => BVC is undefined
      // Should not occur in collision-free configurations
      console.log(err);
      padding = [[r.position.x, r.position.y]];
    }

    return padding;
  }

  checkCollision(){
    // update global time variable
    timeInstance += this.timeDelta;
    
    let detectedCollisions = [];
    let minDist = null;

    this.robots.forEach((r,i) => {
        const distanceMeasurements = r.getNeighborRobotsDistanceMeasurements(this.robots.slice(i+1), 0);

        distanceMeasurements.collisions.forEach(d => detectedCollisions.push(d));
        
        if(minDist == null || distanceMeasurements.minDist < minDist){
          minDist = distanceMeasurements.minDistance; 
        }
      });
    
    if(detectedCollisions.length > 0){
      this.totalCollisionTimeInst += detectedCollisions.length;
      detectedCollisions.forEach(d => this.pushUniqueCollisions(this.uniqueCollisions,d));
    }

    if(this.minDistance == null || minDist < this.minDistance){
      this.minDistance = minDist; 
    }
  }

  pushUniqueCollisions(collisionsArray, newCollision){
    if(collisionsArray.findIndex(x => x[0]==newCollision[0] && x[1]==newCollision[1])==-1){
      collisionsArray.push(newCollision);
    }
  }

  updateDistance(){
    let dis = 0;
    
    this.robots.forEach( r =>{
      dis += r.getDistanceTo(r.goal)/10;
    }
    );

    this.distance = dis;
  }

  getCurRobotsPos(){
    return this.robots.map(r => r.position);
  }

  getCurGoalsPos(){
    return this.robots.map(r => r.goal);
  }

  initializeRobotsRange(numOfRobots, radius, envWidth, envHeight, motionPlanningAlgorithm){
    return  d3.range(numOfRobots)
              .map(i => new Robot(  i,
                                    this.getAnInitialPos(),
                                    this.getAnInitialPos(),
                                    radius,
                                    envWidth,
                                    envHeight,
                                    this,
                                    motionPlanningAlgorithm));    
  }

  getAnInitialPos(){
    return this.robotsStartingPositions.pop();
  }

  getRandomCollisionFreePositions(numOfRobots, radius, envWidth, envHeight){
    const resolution = (radius*2.1);
    let xCount = envWidth / resolution;
    let yCount = envHeight / resolution;

    if(xCount*yCount<numOfRobots*4){
      throw "Invalid inputs, number and size of robots are too high for this environment size!"
    }

    let positions = [];
    let i = 0;
    while (positions.length<numOfRobots*3  && i<numOfRobots*100) {
      const newX = Math.max(radius*2,Math.min(envWidth-radius*2,Math.floor(Math.random()*xCount)*resolution));
      const newY = Math.max(radius*2,Math.min(envHeight-radius*2,Math.floor(Math.random()*yCount)*resolution));
      const newPos = {x:newX, y:newY};

      if(positions.findIndex(x => distanceBetween2Points(x,newPos)<radius*2.5) == -1){
        positions.push(newPos);
      }      
      i++;
    }
    
    if(positions.length<numOfRobots*2){
      throw "Invalid inputs, number and size of robots are too high for this environment size!"
    }

    return positions;
  }

  getCircleCollisionFreePositions(numOfRobots, radius, envWidth, envHeight){
    const circleRadius = Math.min(envWidth,envHeight) * 20 / 42;
    const resolution = Math.PI * 2 / numOfRobots;
    const envCenter = {x: envWidth / 2, y: envHeight / 2};
    
    if(circleRadius*resolution < radius*4){
      throw "Invalid inputs, number and size of robots are too high for this environment size!"
    }

    let positions = [];
    const start = Math.random() * Math.PI * 2
    let i = start;
    while (i< start + Math.PI * 2) {

      const newX = envCenter.x + circleRadius * Math.cos(i);
      const newY = envCenter.y + circleRadius * Math.sin(i);
      const newGoalX = envCenter.x - circleRadius * Math.cos(i);
      const newGoalY = envCenter.y - circleRadius * Math.sin(i);
      const newPos = {x:newX, y:newY};
      const newGoalPos = {x:newGoalX, y:newGoalY};

      positions.push(newPos);
      positions.push(newGoalPos);

      i+= resolution;
    }
    
    if(positions.length<numOfRobots*2){
      throw "Invalid inputs, number and size of robots are too high for this environment size!"
    }

    return positions;
  }

  getSquarePositionsConfig1(numOfRobots, radius, envWidth, envHeight){
    const distanceBetweenPositions = radius * 4.2;
    return this.getSquareCollisionFreePositions(numOfRobots, radius, envWidth, envHeight, distanceBetweenPositions, false);
  }

  getSquarePositionsConfig2(numOfRobots, radius, envWidth, envHeight){
    const distanceBetweenPositions = radius * 4.6;
    return this.getSquareCollisionFreePositions(numOfRobots, radius, envWidth, envHeight, distanceBetweenPositions, true);
  }
  
  getSquareCollisionFreePositions(numOfRobots, radius, envWidth, envHeight, distanceBetweenPositions, invertVertically){
    const resolution = distanceBetweenPositions;
    const robotStart = {x: radius * 10, y: radius * 20};
    const goalsStart = {x: envWidth - radius * 10, y: !invertVertically? radius * 20 : radius * 20 + resolution * 9};

    if(robotStart.x + resolution * 10 > envWidth / 2 || robotStart.y + resolution * 10 > envHeight){
      throw "Invalid inputs, number and size of robots are too high for this environment size!"
    }

    let positions = [];
    
    for (var row = 0; row < 10 ; row++){
      for (var col = 0; col < 10; col ++){
        const newX = robotStart.x + resolution * col + Math.random()*radius/100 + radius/50;
        const newY = robotStart.y + resolution * row + Math.random()*radius/100 + radius/50;
        const newGoalX = goalsStart.x - resolution * col + Math.random()*radius/100 + radius/50;
        const newGoalY = !invertVertically?
                          goalsStart.y + resolution * row + Math.random()*radius/100 + radius/50 :
                          goalsStart.y - resolution * row + Math.random()*radius/100 + radius/50;

        const newPos = {x:newX, y:newY};
        const newGoalPos = {x:newGoalX, y:newGoalY};
  
        positions.push(newGoalPos);
        positions.push(newPos);
      }
    }
    
    if(positions.length<numOfRobots*2){
      throw "Invalid inputs, number and size of robots are too high for this environment size!"
    }

    return positions;
  }

  getNeighborsOf(robotIndex){
    let neighbors = [];
    try{
      for(const neighborIndex of this.voronoi.delaunay.neighbors(robotIndex)){
        neighbors.push(this.getRobotByIndex(neighborIndex));
      }
    } catch(error){
      console.log("Error Exracting Neighbors: " + error);
    }

    return neighbors;
  }
  
  getRobotByIndex(index){
    return this.robots[index];
  }

}
