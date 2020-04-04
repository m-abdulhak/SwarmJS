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
  
        // this.velocity.x = Math.max( Math.abs(xDiff/20), this.radius/2);
        // this.velocity.y = Math.max( Math.abs(yDiff/20), this.radius/2);
  
        // this.velocity.x *= Math.sign(xDiff);
        // this.velocity.y *= Math.sign(yDiff);
        
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
  
      var tempG = null;
      var minDist = null;
  
      // cell.forEach(vertex => {
      //   let distGoalToVertex = distanceBetween2Points(this.goal,{x:vertex[0], y:vertex[1]});
      //   if(tempG==null || distGoalToVertex < minDist){
      //     tempG = {x:vertex[0], y:vertex[1]};
      //     minDist = distGoalToVertex;
      //   } 
      // });
  
      for (let index = 0; index < cell.length-1; index++) {
        const v1 = cell[index];
        const v2 = cell[index+1];
        let closestPointInLineSeg = closestPointInLineSegToPoint(this.goal.x, this.goal.y, v1[0], v1[1], v2[0], v2[1]);
  
        let distGoalToLineSeg = distanceBetween2Points(this.goal, closestPointInLineSeg);
        
        if(tempG==null || distGoalToLineSeg < minDist){
          tempG = {x:closestPointInLineSeg.x, y:closestPointInLineSeg.y};
          minDist = distGoalToLineSeg;
        }
      }
  
      this.tempGoal = tempG;
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