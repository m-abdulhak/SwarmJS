class Scene{
  constructor(svg, numOfRobots, robotRadius, motionPlanningAlgorithm){
    this.svg = svg;
    this.width = svg.attr("width");
    this.height = svg.attr("height");
    this.numOfRobots = numOfRobots;
    this.radius = robotRadius;
    this.collisionFreePositions = this.getCollisionFreePositions(this.numOfRobots, this.radius, this.width, this.height);

    // Initialize Robots
    this.robots = this.initializeRobotsRange(this.numOfRobots, this.radius, this.width, this.height, motionPlanningAlgorithm);

    // Initialize Voronoi Diagram
    this.voronoi = Delaunay
      .from(this.getCurRobotsPos(), d => d.x, d => d.y)
      .voronoi([0, 0, this.width, this.height]);
    
    // Initialize Renderer
    this.renderer = new Renderer(svg, this);

    // Simulation Speed
    this.timeScale = 0.1;

    // Collision Detection
    this.uniqueCollisions = [];
    this.totalCollisionTimeInst = 0;

    // Total Robot-Goal Distances
    this.distance = null;
  }

  setTimeScale(scale){
    this.timeScale = scale/10;
  }

  update(activeElements){
    // TODO: find alternative to using global gScene here instead of "this"
    // Using "this" is causing errors when update() is being called from svg on drag and drop oprations
    gScene.voronoi = Delaunay
    .from(gScene.getCurRobotsPos(), d => d.x, d => d.y)
    .voronoi([0, 0, gScene.width, gScene.height]);

    gScene.updateRobotsMeasurements();

    gScene.robots.forEach(r => r.timeStep(gScene.timeScale));

    gScene.checkCollision();

    gScene.renderer.update(activeElements);

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
      padding = offset.data(cell).padding(r.radius*1.2)[0]
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
    timeInstance += 1/this.timeScale
    //console.log("TimeInstance",timeInstance);
    
    let detectedCollisions = [];

    this.robots.forEach((r,i) => {
        r.getCollisionsAgainstRobots(this.robots.slice(i+1), 0).forEach(d => detectedCollisions.push(d))
      });
    
    if(detectedCollisions.length > 0){
      this.totalCollisionTimeInst += detectedCollisions.length;
      detectedCollisions.forEach(d => this.pushUniqueCollisions(this.uniqueCollisions,d));
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
      dis += r.getDistanceTo(r.goal)/100;
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
                                    this.getRandCollisionFreePos(),
                                    this.getRandCollisionFreePos(),
                                    radius,
                                    envWidth,
                                    envHeight,
                                    this,
                                    motionPlanningAlgorithm));    
  }

  getRandCollisionFreePos(){
    return this.collisionFreePositions.pop();
  }

  getCollisionFreePositions(numOfRobots, radius, envWidth, envHeight){
    const resolution = (radius*2.1);
    let xCount = envWidth / resolution;
    let yCount = envHeight / resolution;

    if(xCount*yCount<numOfRobots*4){
      throw "Invalid inputs, number and size of robots are too high for this environment size!"
    }

    let positions = [];
    let i = 0;
    while (positions.length<numOfRobots*3  && i<numOfRobots*100) {
      const newX = Math.max(radius,Math.min(envWidth-radius,Math.floor(Math.random()*xCount)*resolution));
      const newY = Math.max(radius,Math.min(envHeight-radius,Math.floor(Math.random()*yCount)*resolution));
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
