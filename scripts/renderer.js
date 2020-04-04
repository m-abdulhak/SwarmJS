
class Renderer{
    constructor(svg, scene){
      this.svg = svg;
      this.scene = scene;
      this.scene.BVCLineSegs = [];
  
      // Create line segments between robots and corresponding goal 
      this.scene.robotToGoalLineSegs = svg.append("g")
              .selectAll("path")
              .data(this.scene.robots)
              .enter()
              .append("path")
              .attr("fill", "none")
              .attr("stroke", (d, i) => d3.schemeCategory10[i % 10])
              .attr("stroke-width", 1)
              .attr("stroke-dasharray","10,10")
              .attr("d", d => this.renderLineSeg(d.position.x, d.position.y, d.goal.x, d.goal.y));
  
      // Create line segments between robots and corresponding temp goal 
      this.scene.robotToTempGoalLineSegs = svg.append("g")
              .selectAll("path")
              .data(this.scene.robots)
              .enter()
              .append("path")
              .attr("fill", "none")
              .attr("stroke", (d, i) => d3.schemeCategory10[i % 10])
              .attr("stroke-width", 1)
              .attr("stroke-dasharray","1,10")
              .attr("d", d => this.renderLineSeg(d.position.x, d.position.y, d.tempGoal.x, d.tempGoal.y));
              
      // Create line segments between each robot's temp goal and goal 
      this.scene.tempGoalToGoalLineSegs = svg.append("g")
              .selectAll("path")
              .data(this.scene.robots)
              .enter()
              .append("path")
              .attr("fill", "none")
              .attr("stroke", (d, i) => d3.schemeCategory10[i % 10])
              .attr("stroke-width", 1)
              .attr("stroke-dasharray","1,10")
              .attr("d", d => this.renderLineSeg(d.tempGoal.x, d.tempGoal.y, d.goal.x, d.goal.y));
  
      // Buffered Voronoi cells edges
      this.scene.BvcMesh = svg.append("path")
            .attr("fill", "none")
            .attr("stroke", "#cccccc70")
            .attr("stroke-width", this.scene.radius*2)
            .attr("d", this.scene.voronoi.render());
  
      // Voronoi cells edges
      this.scene.VcMesh = svg.append("path")
            .attr("fill", "none")
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("d", this.scene.voronoi.render());
  
      // Voronoi cells
      this.scene.vCells = svg.append("g")
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .selectAll("path")
            .data(this.scene.getCurRobotsPos())
            .enter()
            .append("path")
            .attr("d", (d, i) => this.scene.voronoi.renderCell(i));
  
      // Robots
      this.scene.robotsCircles = svg.append("g")
            .selectAll("circle")
            .data(this.scene.robots)
            .enter()
            .append("circle")
            .attr("cx", d => d.position.x)
            .attr("cy", d => d.position.y)
            .attr("id", d => d.id)
            .attr("r", d => d.radius)
            .attr("fill", (d, i) => d3.schemeCategory10[i % 10])
            .call(d3.drag()
                  .on("start", d => this.scene.robotsCircles.filter(p => p.id === d.id).raise().attr("stroke", "black"))
                  .on("drag", d => (d.position.x = d3.event.x, d.position.y = d3.event.y))
                  .on("end", d => this.scene.robotsCircles.filter(p => p.id === d.id).attr("stroke", null))
                  .on("start.update drag.update end.update", this.scene.update));
  
      // Temp Goals
      this.scene.tempGoalsCircles = svg.append("g")
            .attr("fill-opacity", "40%")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray","1,1")
            .selectAll("circle")
            .data(this.scene.robots)
            .enter()
            .append("circle")
            .attr("cx", d => d.tempGoal.x)
            .attr("cy", d => d.tempGoal.y)
            .attr("id", d => d.id)
            .attr("r", d => d.radius/1.5)
            .attr("fill", (d, i) => d3.schemeCategory10[i % 10])
            .attr("stroke",  (d, i) => d3.schemeCategory10[i % 10]);
      
      // Goals
      this.scene.goalsCircles = svg.append("g")
            .selectAll("circle")
            .data(this.scene.robots)
            .enter()
            .append("circle")
            .attr("cx", d => d.goal.x)
            .attr("cy", d => d.goal.y)
            .attr("id", d => d.id)
            .attr("r", d => d.radius/4)
            .attr("fill", (d, i) => d3.schemeCategory10[i % 10])
            .call(d3.drag()
                  .on("start", d => this.scene.goalsCircles.filter(p => p.id === d.id).raise().attr("stroke", "black"))
                  .on("drag", d => (d.goal.x = d3.event.x, d.goal.y = d3.event.y))
                  .on("end", d => this.scene.goalsCircles.filter(p => p.id === d.id).attr("stroke", null))
                  .on("start.update drag.update end.update", this.scene.update));
      
    }
  
    update(){
      this.svg.selectAll(".bvc-seg").remove();
      this.scene.BVCLineSegs = [];
      this.scene.robots.forEach((r,rIndex) => {
        //console.log(r);
        if(typeof(r.BVC) !== "undefined" && r.BVC.length>0){
          // Create line segments between robots and corresponding goal 
          //console.log(r.BVC);
          this.scene.BVCLineSegs.push(this.svg.append("g")
                  .selectAll("path")
                  .data(r.BVC)
                  .enter()
                  .append("path")
                  .attr("class", "bvc-seg")
                  .attr("fill", "none")
                  .attr("stroke", (d, i) => d3.schemeCategory10[rIndex % 10])
                  .attr("stroke-width", 1)
                  .attr("stroke-dasharray","10,10")
                  .attr("d", (d,i) => this.renderLineSeg(r.BVC[i][0], r.BVC[i][1], r.BVC[nxtCircIndx(i,r.BVC.length)][0], r.BVC[nxtCircIndx(i,r.BVC.length)][1]))
                  );
        } else{
          //console.log("null");        
        }
      });   
  
      this.scene.vCells.attr("d", (d, i) => this.scene.voronoi.renderCell(i));
      this.scene.robotToGoalLineSegs.attr("d", d => this.renderLineSeg(d.position.x, d.position.y, d.goal.x, d.goal.y));
      this.scene.robotToTempGoalLineSegs.attr("d", d => this.renderLineSeg(d.position.x, d.position.y, d.tempGoal.x, d.tempGoal.y));
      this.scene.tempGoalToGoalLineSegs.attr("d", d => this.renderLineSeg(d.tempGoal.x, d.tempGoal.y, d.goal.x, d.goal.y));
      this.scene.BvcMesh.attr("d", this.scene.voronoi.render());
      this.scene.VcMesh.attr("d", this.scene.voronoi.render());
      this.scene.robotsCircles.attr("cx", d => d.position.x).attr("cy", d => d.position.y);
      this.scene.tempGoalsCircles.attr("cx", d => d.tempGoal.x).attr("cy", d => d.tempGoal.y);
      this.scene.goalsCircles.attr("cx", d => d.goal.x).attr("cy", d => d.goal.y);
    }
    
    renderLineSeg(x1,y1,x2,y2){
      return `M${x1},${y1}L${x2},${y2}Z`
    }
  }
  