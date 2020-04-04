class Robot{
  constructor(id, position, goal, radius, envWidth, envHeight, scene, motionPlanningAlgorithm){
    // configs
    this.MovementGoals = { Random: 0, 
                          GoalStraight: 1, 
                          GoalWithVC: 2 , 
                          GoalWithBVC: 3 };

    this.id = id;
    this.position = position;
    this.prevPosition = position;
    this.goal = goal;
    this.tempGoal = null;
    this.radius = radius;
    this.envWidth = envWidth;
    this.envHeight = envHeight;
    this.scene = scene;
    this.VC = [];

    // Initialize velocity according to movement goal
    this.velocity = {x: 0, y: 0};
    this.setMovementGoal(motionPlanningAlgorithm);

    // Initialize deadlock detection mechanisms
    this.deadLockDetectionEnabled = true;
    this.deadLockDetectionDuration = 5;
    this.stuckAtTempGoalDuration = 0;
    this.detectedDeadLocksCount = 0;
    
    // Initialize deadlock recovery mechanisms
    this.deadLockRecoveryEnabled = true; 
    this.deadLockRecoveryDefaultDuration = 30;
    this.deadLockRecoveryDuration = this.deadLockRecoveryDefaultDuration;
    this.performingDeadLockRecovery = 0;
    this.consecutiveDeadlockManeuvers = 0;
  }

  timeStep(timeDelta){
    this.updateVelocity();
    this.limitGoal();
    this.prevPosition = this.position;
    this.position = this.limitPos({   x: this.position.x + this.velocity.x * timeDelta,
                                      y: this.position.y + this.velocity.y * timeDelta});
  }

  setMovementGoal(movementGoal){
    this.movementGoal = movementGoal;

    switch (this.movementGoal ) {
      case this.MovementGoals.Random:
        this.tempGoal = this.goal;
        this.velocity = {x: (Math.random()-0.5) * this.radius, y: (Math.random()-0.5) * this.radius};
        break;
      case this.MovementGoals.GoalStraight:
        this.tempGoal = this.goal;
        this.updateVelocity();
        break;
      case this.MovementGoals.GoalWithVC:
        this.setTempGoalVC(this.VC);
        this.updateVelocity();
        break;
      case this.MovementGoals.GoalWithBVC:
        this.setTempGoalVC(this.BVC);
        this.updateVelocity();
        break;
      default:
        this.tempGoal = this.goal;
        this.updateVelocity();
        break;
    }
  }

  updateVelocity(){
    switch (this.movementGoal) {
      case this.MovementGoals.Random:
        this.tempGoal = this.goal;
        // should not change random speed at each time step to avoid vibrating in place 
        break;
      case this.MovementGoals.GoalStraight:
        this.tempGoal = this.goal;
        this.setVelocityTo(this.goal);
        break;
      case this.MovementGoals.GoalWithVC:
        this.setTempGoalVC(this.VC);
        this.setVelocityTo(this.tempGoal,3);
        break;
      case this.MovementGoals.GoalWithBVC:
        this.setTempGoalVC(this.BVC);
        this.setVelocityTo(this.tempGoal,3);
        break;
      default:
        this.tempGoal = this.goal;
        break;
    }
  }

  setVelocityTo(point, velocityScale = 20){
    if(this.reached(point)){
      this.velocity = {x:0, y:0};
    } else{
      const xDiff = point.x - this.position.x;
      const yDiff = point.y - this.position.y;

      this.velocity.x = xDiff/velocityScale;
      this.velocity.y = yDiff/velocityScale;
    }
  }

  setTempGoalVC(cell){
    if(this.VcContains(this.goal)){
      this.tempGoal = this.goal;
      return;
    }
    
    if(cell == null || cell.length<2){
      this.tempGoal = this.goal;
      return;
    }

    if(this.performingDeadLockRecovery > 0){
      this.performingDeadLockRecovery -= 1;
      if(this.deadLockTempGoalStillValid()){
        return;
      } else{
        if(this.detectedDeadLocksCount>1 && this.consecutiveDeadlockManeuvers == 0){
          this.consecutiveDeadlockManeuvers += 1;
          this.initiateDeadlockManeuver();
          return;
        } else{
          this.consecutiveDeadlockManeuvers = 0;
          this.performingDeadLockRecovery = 0;
        }
      }
    } else if(this.deadLocked()){
      this.detectedDeadLocksCount += 1;

      if(this.deadLockRecoveryEnabled){
        this.initiateDeadlockManeuver();
        return;
      }
    }

    this.tempGoal = this.findTempGoalInCell(cell);
  }

  findTempGoalInCell(cell){
    var tempG = null;
    var minDist = null;

    for (let index = 0; index < cell.length; index++) {
      const v1 = cell[index];
      const v2 = cell[nxtCircIndx(index,cell.length)];
      let closestPointInLineSeg = closestPointInLineSegToPoint(this.goal.x, this.goal.y, v1[0], v1[1], v2[0], v2[1]);

      let distGoalToLineSeg = distanceBetween2Points(this.goal, closestPointInLineSeg);
      
      if(tempG==null || distGoalToLineSeg < minDist){
        tempG = {x:closestPointInLineSeg.x, y:closestPointInLineSeg.y};
        minDist = distGoalToLineSeg;
      }
    }

    return tempG;
  }

  deadLocked(){
    if(this.reached(this.tempGoal) && !this.reached(this.goal)){
      this.stuckAtTempGoalDuration += 1;
    } else{
      this.stuckAtTempGoalDuration = 0;
    }

    return this.deadLockDetectionEnabled && this.stuckAtTempGoalDuration > this.deadLockDetectionDuration;
  }

  initiateDeadlockManeuver(){
    this.deadLockRecoveryDuration = (this.detectedDeadLocksCount+1) * this.deadLockRecoveryDefaultDuration ;
    if(Math.random()>0.5){
      this.tempGoal = this.getFurthestVertexFromLineSeg(this.BVC, this.position, this.goal);
    } else{
      this.tempGoal = this.getRandomVertex(this.BVC);
    }
    this.performingDeadLockRecovery = this.deadLockRecoveryDuration;
  }

  deadLockTempGoalStillValid(){
    return !this.reached(this.tempGoal) && this.scene.voronoi.contains(this.id, this.tempGoal.x, this.tempGoal.y);
  }

  getFurthestVertexFromLineSeg(cell, linesSegP1, lineSegP2){
    let bestVertex = cell[0];
    let maxDist = null;

    cell.forEach(vertex => {
      let dist = distanceBetweenPointAndLine({x:vertex[0], y:vertex[1]}, linesSegP1, lineSegP2);
      if(maxDist == null || dist > maxDist){
        bestVertex = vertex;
        maxDist = dist; 
      }  
    });
    return {x:bestVertex[0], y:bestVertex[1]};
  }

  getRandomVertex(cell){
    let vertex = cell[Math.floor(Math.random()*cell.length)];
    return {x:vertex[0], y:vertex[1]};
  }

  VcContains(point){
    return typeof(this.scene.voronoi) !== "undefined" && this.scene.voronoi != null && 
        this.scene.voronoi.contains(this.id, point.x, point.y);
  }

  reached(point){
    var ret = this.getDistanceTo(point) <= this.radius/10
    return ret;
  }

  getDistanceTo(point){
    var ret =  distanceBetween2Points(this.position, point);
    return ret;
  }

  limitPos(position){
    const radius = this.radius;
    this.velocity.x = position.x <= radius || position.x >= this.envWidth-radius ? this.velocity.x * -1 : this.velocity.x; 
    this.velocity.y = position.y <= radius || position.y >= this.envHeight-radius ? this.velocity.y * -1 : this.velocity.y;

    return {  x: Math.min( Math.max(radius, position.x), this.envWidth-radius),
              y: Math.min( Math.max(radius, position.y), this.envHeight-radius)};
  }

  limitGoal(){
    const radius = this.radius;
    this.goal = {   x: Math.min( Math.max(radius, this.goal.x), this.envWidth-radius),
                    y: Math.min( Math.max(radius, this.goal.y), this.envHeight-radius)};  
  }

  collidingWithRobot(r){
    return distanceBetween2Points(this.position,r.position) < this.radius*2;
  }

  getCollisionsAgainstRobots(robots, prevent=false){
    let collisions = [];
    robots.forEach(r => {
      if(this.collidingWithRobot(r)){
        collisions.push([Math.min(this.id, r.id), Math.max(this.id, r.id)]);
      }
    });
    return collisions;
  }
}