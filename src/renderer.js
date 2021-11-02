/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-sequences */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import * as d3 from 'd3';
import { Body } from 'matter-js';
import { nxtCircIndx } from './geometry';

export default class Renderer {
  constructor(svg, scene) {
    this.svg = svg;
    this.scene = scene;
    this.pauseStateOnDragStart = null;

    // Buffered voronoi cells line segments (as calculated by robots)
    this.BVCLineSegs = [];

    // Static Circles
    this.staticCircles = svg.append('g')
      .selectAll('circle')
      .data(this.scene.staticObjects.filter((obj) => obj.def.type === 'circle'))
      .enter()
      .append('circle')
      .attr('cx', (d) => d.center.x)
      .attr('cy', (d) => d.center.y)
      .attr('r', (d) => d.radius)
      .attr('fill', '#000000');

    // Static Rectangles
    this.staticRectangles = svg.append('g')
      .selectAll('rect')
      .data(this.scene.staticObjects.filter((obj) => obj.def.type === 'rectangle'))
      .enter()
      .append('rect')
      .attr('x', (d) => d.center.x - d.width / 2)
      .attr('y', (d) => d.center.y - d.height / 2)
      .attr('width', (d) => d.width)
      .attr('height', (d) => d.height)
      .attr('fill', '#000000');

    // Voronoi cells edges (Voronoi Diagram)
    this.VcMesh = svg.append('path')
      .attr('fill', 'none')
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .attr('d', this.scene.voronoi.render());

    // Buffered Voronoi cells edges (from Voronoi Diagram)
    this.BvcMesh = svg.append('path')
      .attr('fill', 'none')
      .attr('stroke', '#cccccc70')
      .attr('stroke-width', this.scene.radius * 2)
      .attr('d', this.scene.voronoi.render());

    // Temp Goals
    this.tempGoalsCircles = svg.append('g')
      .attr('fill-opacity', '40%')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '1,1')
      .selectAll('circle')
      .data(this.scene.robots)
      .enter()
      .append('circle')
      .attr('cx', (d) => d.tempGoal.x)
      .attr('cy', (d) => d.tempGoal.y)
      .attr('id', (d) => d.id)
      .attr('r', (d) => d.radius / 1.5)
      .attr('fill', (d, i) => d3.schemeCategory10[i % 10])
      .attr('stroke', (d, i) => d3.schemeCategory10[i % 10]);

    // Line segments between robots and corresponding temp goal
    this.robotToTempGoalLineSegs = svg.append('g')
      .selectAll('path')
      .data(this.scene.robots)
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', (d, i) => d3.schemeCategory10[i % 10])
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '1,10')
      .attr('d', (d) => this.renderLineSeg(d.position.x, d.position.y, d.tempGoal.x, d.tempGoal.y));

    // Line segments between each robot's temp goal and goal
    this.tempGoalToGoalLineSegs = svg.append('g')
      .selectAll('path')
      .data(this.scene.robots)
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', (d, i) => d3.schemeCategory10[i % 10])
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '1,10')
      .attr('d', (d) => this.renderLineSeg(d.tempGoal.x, d.tempGoal.y, d.goal.x, d.goal.y));

    // Puck Goals
    this.puckGoalsCircles = svg.append('g')
      .selectAll('circle')
      .data(this.scene.pucksGroups)
      .enter()
      .append('circle')
      .attr('cx', (d) => d.goal.x)
      .attr('cy', (d) => d.goal.y)
      .attr('id', (d, i) => i)
      .attr('r', (d) => d.radius * 12)
      .attr('fill', (d) => d.color)
      .attr('fill-opacity', '10%');

    // Robots
    this.robotsCircles = svg.append('g')
      .selectAll('circle')
      .data(this.scene.robots)
      .enter()
      .append('circle')
      .attr('cx', (d) => d.position.x)
      .attr('cy', (d) => d.position.y)
      .attr('id', (d) => d.id)
      .attr('r', (d) => d.radius)
      .attr('fill', '#FFC53A')
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .call(d3.drag()
        .on('start', (event, d) => {
          this.robotsCircles.filter((p) => p.id === d.id).raise().attr('stroke', 'green');
          this.pauseStateOnDragStart = paused;
          paused = true;
          console.log(`Moving Robot ${d.id}`);
        })
        .on('drag', (event, d) => {
          Body.set(d.body, 'position', { x: event.x, y: event.y });
          this.update(activeElements);
        })
        .on('end', (event, d) => {
          this.robotsCircles.filter((p) => p.id === d.id).attr('stroke', 'black');
          paused = this.pauseStateOnDragStart == null ? false : this.pauseStateOnDragStart;
        }));

    // Line segments between robots and corresponding goal
    this.robotToGoalLineSegs = svg.append('g')
      .selectAll('path')
      .data(this.scene.robots)
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', (d, i) => d3.schemeCategory10[i % 10])
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '10,10')
      .attr('d', (d) => this.renderLineSeg(d.position.x, d.position.y, d.goal.x, d.goal.y));

    // Goals
    this.goalsCircles = svg.append('g')
      .selectAll('circle')
      .data(this.scene.robots)
      .enter()
      .append('circle')
      .attr('cx', (d) => d.goal.x)
      .attr('cy', (d) => d.goal.y)
      .attr('id', (d) => d.id)
      .attr('r', (d) => d.radius / 4)
      .attr('fill', (d, i) => d3.schemeCategory10[i % 10])
      .attr('stroke', 'white')
      .attr('stroke-dasharray', '0.5,0.5')
      .call(d3.drag()
        .on('start', (event, d) => {
          this.goalsCircles.filter((p) => p.id === d.id).raise().attr('stroke', 'black');
          this.pauseStateOnDragStart = paused;
          paused = true;
          console.log(`Moving Goal For Robot ${d.id}`);
        })
        .on('drag', (event, d) => {
          d.goal.x = event.x;
          d.goal.y = event.y;
          this.update(activeElements);
        })
        .on('end', (event, d) => {
          this.goalsCircles.filter((p) => p.id === d.id).attr('stroke', 'lightgray');
          paused = this.pauseStateOnDragStart == null ? false : this.pauseStateOnDragStart;
        }));

    // Puck
    this.pucksCircles = svg.append('g')
      .selectAll('circle')
      .data(this.scene.pucks)
      .enter()
      .append('circle')
      .attr('cx', (d) => d.position.x)
      .attr('cy', (d) => d.position.y)
      .attr('id', (d) => d.id)
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => d.color)
      .call(d3.drag()
        .on('start', (event, d) => {
          this.pucksCircles.filter((p) => p.id === d.id).raise().attr('stroke', 'black');
          this.pauseStateOnDragStart = paused;
          paused = true;
          console.log(`Moving Puck ${d.id}`);
        })
        .on('drag', (event, d) => {
          Body.set(d.body, 'position', { x: event.x, y: event.y });
          this.update(activeElements);
        })
        .on('end', (event, d) => {
          this.pucksCircles.filter((p) => p.id === d.id).attr('stroke', 'lightgray');
          paused = this.pauseStateOnDragStart == null ? false : this.pauseStateOnDragStart;
        }));
  }

  removeElements(selectionQuery) {
    let selection = this.svg.selectAll(selectionQuery).node();
    while (selection) {
      selection.parentNode.remove();
      selection = this.svg.selectAll(selectionQuery).node();
    }
  }

  update(activeElements) {
    this.removeElements('.bvc-seg');

    this.BVCLineSegs = [];

    this.scene.robots.forEach((r, rIndex) => {
      if (typeof (r.BVC) !== 'undefined' && r.BVC.length > 0) {
        this.BVCLineSegs.push(
          this.svg.append('g')
            .selectAll('path')
            .data(r.BVC)
            .enter()
            .append('path')
            .attr('class', 'bvc-seg')
            .attr('fill', 'none')
            .attr('stroke', (d, i) => d3.schemeCategory10[rIndex % 10])
            .attr('stroke-width', 1)
            .attr('stroke-opacity', activeElements.BVC ? '100%' : '0%')
            .attr('stroke-dasharray', '10,10')
            .attr('d', (d, i) => this.renderLineSeg(
              r.BVC[i][0],
              r.BVC[i][1],
              r.BVC[nxtCircIndx(i, r.BVC.length)][0],
              r.BVC[nxtCircIndx(i, r.BVC.length)][1],
            )),
        );
      } else {
        // console.log("null");
      }
    });

    this.BvcMesh.attr('d', this.scene.voronoi.render())
      .attr('stroke-opacity', activeElements.VC ? '100%' : '0%');

    this.VcMesh.attr('d', this.scene.voronoi.render())
      .attr('stroke-opacity', activeElements.VC ? '100%' : '0%');

    this.tempGoalsCircles.attr('cx', (d) => d.tempGoal.x).attr('cy', (d) => d.tempGoal.y)
      .attr('stroke-opacity', activeElements.TempGoals ? '40%' : '0%')
      .attr('fill-opacity', activeElements.TempGoals ? '40%' : '0%');

    this.robotToTempGoalLineSegs.attr('d', (d) => this.renderLineSeg(d.position.x, d.position.y, d.tempGoal.x, d.tempGoal.y))
      .attr('stroke-opacity', activeElements.TempGoals ? '100%' : '0%');

    this.tempGoalToGoalLineSegs.attr('d', (d) => this.renderLineSeg(d.tempGoal.x, d.tempGoal.y, d.goal.x, d.goal.y))
      .attr('stroke-opacity', activeElements.TempGoals ? '100%' : '0%');

    this.robotsCircles.attr('cx', (d) => d.position.x).attr('cy', (d) => d.position.y)
      .attr('stroke-opacity', activeElements.Robots ? '100%' : '0%')
      .attr('fill-opacity', activeElements.Robots ? '100%' : '0%');

    this.pucksCircles.attr('cx', (d) => d.position.x).attr('cy', (d) => d.position.y)
      .attr('stroke-opacity', activeElements.Robots ? '100%' : '0%')
      .attr('fill-opacity', activeElements.Robots ? '100%' : '0%');

    this.robotToGoalLineSegs.attr('d', (d) => this.renderLineSeg(d.position.x, d.position.y, d.goal.x, d.goal.y))
      .attr('stroke-opacity', activeElements.Goals ? '100%' : '0%');

    this.goalsCircles.attr('cx', (d) => d.goal.x).attr('cy', (d) => d.goal.y)
      .attr('stroke-opacity', activeElements.Goals ? '100%' : '0%')
      .attr('fill-opacity', activeElements.Goals ? '100%' : '0%');
  }

  renderLineSeg(x1, y1, x2, y2) {
    return `M${x1},${y1}L${x2},${y2}Z`;
  }
}
