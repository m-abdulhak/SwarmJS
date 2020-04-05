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
    }
  
    setTimeScale(scale){
      this.timeScale = scale/10;
    }
  
    update(activeElements){
      // TODO: find alternative to using global gScene here instead of "this"
      // Using "this" is causing errors when update() is being called from svg on drag and drop oprations
      gScene.updateRobotsMeasurements();
  
      gScene.robots.forEach(r => r.timeStep(gScene.timeScale));
  
      gScene.checkCollision(false);
  
      gScene.voronoi = Delaunay
         .from(gScene.getCurRobotsPos(), d => d.x, d => d.y)
         .voronoi([0, 0, gScene.width, gScene.height]);
  
      gScene.renderer.update(activeElements);
    }
  
    updateRobotsMeasurements(){
      this.robots.forEach((r,i) => {
        let cell = this.voronoi.cellPolygon(i);
        r.VC = cell;
        
        let shiftedLineSegs = [];
  
        for (let index = 0; index < cell.length-1; index++) {
          let lineSeg = [cell[index], cell[index+1]];
          let shiftedLineSeg = shiftLineSegInDirOfPerpendicularBisector(lineSeg[0][0], lineSeg[0][1], lineSeg[1][0], lineSeg[1][1], r.radius*1.2);
          shiftedLineSegs.push(shiftedLineSeg);
        }
  
        let BVC = [];
        let skipNext = false;
  
        for (let index = 0; index < shiftedLineSegs.length; index++) {
          if(skipNext){
            skipNext = false;
            continue;
          }
          let vcIndx = index;
          let vcIndx2 = nxtCircIndx(vcIndx,shiftedLineSegs.length);
          let vcIndx3 = nxtCircIndx(vcIndx2,shiftedLineSegs.length);
  
          let vcLineSeg1 = [{x:cell[vcIndx][0], y:cell[vcIndx][1]}, {x:cell[vcIndx2][0], y:cell[vcIndx2][1]}];
  
          let lineSeg1 = shiftedLineSegs[vcIndx];
          let lineSeg2 = shiftedLineSegs[vcIndx2];
          let lineSeg3 = shiftedLineSegs[vcIndx3];
  
          let intersectionPoint = getIntersectionPoint( lineSeg1[0].x, lineSeg1[0].y, lineSeg1[1].x, lineSeg1[1].y,
                                                        lineSeg2[0].x, lineSeg2[0].y, lineSeg2[1].x, lineSeg2[1].y);
  
          let intersectionPoint2 = getIntersectionPoint( lineSeg2[0].x, lineSeg2[0].y, lineSeg2[1].x, lineSeg2[1].y,
                                                        lineSeg3[0].x, lineSeg3[0].y, lineSeg3[1].x, lineSeg3[1].y);
  
          let dist1 = distanceBetweenPointAndLineSeg(intersectionPoint, vcLineSeg1[0], vcLineSeg1[1]);
          let dist2 = distanceBetweenPointAndLineSeg(intersectionPoint2, vcLineSeg1[0], vcLineSeg1[1]);
          let cond = dist2 < dist1;
  
          if(shiftedLineSegs.length > 3 && cond){
            // console.log("error");
            BVC.push([intersectionPoint2.x, intersectionPoint2.y]);
            skipNext = true;
          }else{
            BVC.push([intersectionPoint.x, intersectionPoint.y]);
          }
        }    
        
        r.BVC = BVC;
  
        //console.log(r,i,this.voronoi.cellPolygon(i));
        //r.neighbors = Array.from(this.voronoi.neighbors(i)).map(i=> this.robots[i]);
        //console.log(r,i,Array.from(this.voronoi.neighbors(i)).map(i=> this.robots[i]));
      })
    }
  
    checkCollision(preventCollision = false){
      let detectedCollisions = [];
  
      this.robots.forEach((r,i) => {
          r.getCollisionsAgainstRobots(this.robots.slice(i+1), 0).forEach(d => detectedCollisions.push(d))
        });
     
      if(detectedCollisions.length > 0){
        this.totalCollisionTimeInst += detectedCollisions.length;
        detectedCollisions.forEach(d => this.pushUniqueCollisions(this.uniqueCollisions,d));
        //console.log(this.totalCollisionTimeInst, detectedCollisions, this.uniqueCollisions);
      }
    }
  
    pushUniqueCollisions(collisionsArray, newCollision){
      if(collisionsArray.findIndex(x => x[0]==newCollision[0] && x[1]==newCollision[1])==-1){
        collisionsArray.push(newCollision);
      }
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
  
      //console.log(positions);
      return positions;
    }
  }