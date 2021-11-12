/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
import * as d3 from 'd3';

import { Body } from 'matter-js';
import { nxtCircIndx } from './geometry';

const renderLineSeg = (x1, y1, x2, y2) => `M${x1},${y1}L${x2},${y2}Z`;

const removeElements = (svg, selectionQuery) => {
  let selection = svg.selectAll(selectionQuery).node();
  while (selection) {
    selection.parentNode.remove();
    selection = svg.selectAll(selectionQuery).node();
  }
};

export default class Renderer {
  constructor() {
    this.initialized = false;
    this.renderingElements = [
      'All', 'Robots', 'Pucks', 'Goals', 'TempGoals', 'VC', 'BVC'
    ];
    this.activeElements = [...this.renderingElements];

    this.setElementEnabled = (element, state) => {
      const otherActiveElements = this.activeElements.filter((e) => e !== element);
      this.activeElements = state ? [...otherActiveElements, element] : [...otherActiveElements];
    };

    this.setElementEnabled.bind(this);
  }

  initialize(svg, scene) {
    if (svg) {
      svg.selectAll('*').remove();
    }
    this.pauseStateOnDragStart = null;

    // Buffered voronoi cells line segments (as calculated by robots)
    this.BVCLineSegs = [];

    // Static Circles
    this.staticCircles = svg.append('g')
      .selectAll('circle')
      .data(scene.staticObjects.filter((obj) => obj.def.type === 'circle'))
      .enter()
      .append('circle')
      .attr('cx', (d) => d.center.x)
      .attr('cy', (d) => d.center.y)
      .attr('r', (d) => d.radius)
      .attr('fill', '#000000');

    // Static Rectangles
    this.staticRectangles = svg.append('g')
      .selectAll('rect')
      .data(scene.staticObjects.filter((obj) => obj.def.type === 'rectangle'))
      .enter()
      .append('rect')
      .attr('x', (d) => d.center.x - d.width / 2)
      .attr('y', (d) => d.center.y - d.height / 2)
      .attr('width', (d) => d.width)
      .attr('height', (d) => d.height)
      .attr('fill', '#000000');

    // Voronoi cells edges (Voronoi Diagram)
    const voronoiMesh = scene.voronoi.render();
    this.VcMeshBG = svg.append('path')
      .attr('stroke', '#777')
      .attr('stroke-width', 2)
      .attr('d', voronoiMesh);
    this.VcMesh = svg.append('path')
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .attr('d', voronoiMesh);

    // Temp Goals
    this.tempGoalsCircles = svg.append('g')
      .attr('fill-opacity', '40%')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '1,1')
      .selectAll('circle')
      .data(scene.robots)
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
      .data(scene.robots)
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', (d, i) => d3.schemeCategory10[i % 10])
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '1,10')
      .attr('d', (d) => renderLineSeg(d.position.x, d.position.y, d.tempGoal.x, d.tempGoal.y));

    // Line segments between each robot's temp goal and goal
    this.tempGoalToGoalLineSegs = svg.append('g')
      .selectAll('path')
      .data(scene.robots)
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', (d, i) => d3.schemeCategory10[i % 10])
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '1,10')
      .attr('d', (d) => renderLineSeg(d.tempGoal.x, d.tempGoal.y, d.goal.x, d.goal.y));

    // Puck Goals
    this.puckGoalsCircles = svg.append('g')
      .selectAll('circle')
      .data(scene.pucksGroups)
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
      .data(scene.robots)
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
          this.pauseStateOnDragStart = scene.paused;
          scene.pause();
          console.log(`Moving Robot ${d.id}`);
        })
        .on('drag', (event, d) => {
          Body.set(d.body, 'position', { x: event.x, y: event.y });
          // this.update(this.activeElements);
        })
        .on('end', (event, d) => {
          this.robotsCircles.filter((p) => p.id === d.id).attr('stroke', 'black');
          scene.paused = this.pauseStateOnDragStart == null
            ? false : this.pauseStateOnDragStart;
        }));

    // Line segments between robots and corresponding goal
    this.robotToGoalLineSegs = svg.append('g')
      .selectAll('path')
      .data(scene.robots)
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', (d, i) => d3.schemeCategory10[i % 10])
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '10,10')
      .attr('d', (d) => renderLineSeg(d.position.x, d.position.y, d.goal.x, d.goal.y));

    // Goals
    this.goalsCircles = svg.append('g')
      .selectAll('circle')
      .data(scene.robots)
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
          this.pauseStateOnDragStart = scene.paused;
          scene.unPause();
          console.log(`Moving Goal For Robot ${d.id}`);
        })
        .on('drag', (event, d) => {
          d.goal.x = event.x;
          d.goal.y = event.y;
          // this.update(this.activeElements);
        })
        .on('end', (event, d) => {
          this.goalsCircles.filter((p) => p.id === d.id).attr('stroke', 'lightgray');
          scene.paused = this.pauseStateOnDragStart == null
            ? false : this.pauseStateOnDragStart;
        }));

    // Puck
    this.pucksCircles = svg.append('g')
      .selectAll('circle')
      .data(scene.pucks)
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
          this.pauseStateOnDragStart = scene.paused;
          scene.pause();
          console.log(`Moving Puck ${d.id}`);
        })
        .on('drag', (event, d) => {
          Body.set(d.body, 'position', { x: event.x, y: event.y });
          // this.update(this.activeElements);
        })
        .on('end', (event, d) => {
          this.pucksCircles.filter((p) => p.id === d.id).attr('stroke', 'lightgray');
          scene.paused = this.pauseStateOnDragStart == null
            ? false : this.pauseStateOnDragStart;
        }));

    this.initialized = true;
  }

  update(svgEl, scene) {
    if (!svgEl || !scene) {
      return;
    }

    const svg = d3.select(svgEl);

    if (!this.initialized) {
      this.initialize(svg, scene);
    }

    removeElements(svg, '.bvc-seg');

    this.BVCLineSegs = [];

    if (!this.activeElements.includes('All')) {
      return;
    }

    if (this.activeElements.includes('BVC')) {
      scene.robots.forEach((r, rIndex) => {
        if (typeof (r.BVC) !== 'undefined' && r.BVC.length > 0) {
          this.BVCLineSegs.push(
            svg.append('g')
              .selectAll('path')
              .data(r.BVC)
              .enter()
              .append('path')
              .attr('class', 'bvc-seg')
              .attr('fill', 'none')
              .attr('stroke', () => d3.schemeCategory10[rIndex % 10])
              .attr('stroke-width', 1)
              .attr('stroke-dasharray', '10,10')
              .attr('d', (d, i) => renderLineSeg(
                r.BVC[i][0],
                r.BVC[i][1],
                r.BVC[nxtCircIndx(i, r.BVC.length)][0],
                r.BVC[nxtCircIndx(i, r.BVC.length)][1]
              ))
          );
        }
      });
    }

    if (this.activeElements.includes('VC')) {
      const vcMesh = scene.voronoi.render();
      this.VcMeshBG
        .attr('d', vcMesh)
        .attr('stroke-opacity', '100%');
      this.VcMesh
        .attr('d', vcMesh)
        .attr('stroke-opacity', '100%');
    } else {
      this.VcMeshBG.attr('stroke-opacity', '0%');
      this.VcMesh.attr('stroke-opacity', '0%');
    }

    if (this.activeElements.includes('TempGoals')) {
      this.tempGoalsCircles
        .attr('cx', (d) => d.tempGoal.x)
        .attr('cy', (d) => d.tempGoal.y)
        .attr('stroke-opacity', '40%')
        .attr('fill-opacity', '40%');

      this.robotToTempGoalLineSegs
        .attr('d', (d) => renderLineSeg(d.position.x, d.position.y, d.tempGoal.x, d.tempGoal.y))
        .attr('stroke-opacity', '100%');

      this.tempGoalToGoalLineSegs
        .attr('d', (d) => renderLineSeg(d.tempGoal.x, d.tempGoal.y, d.goal.x, d.goal.y))
        .attr('stroke-opacity', '100%');
    } else {
      this.tempGoalsCircles
        .attr('stroke-opacity', '0%')
        .attr('fill-opacity', '0%');

      this.robotToTempGoalLineSegs
        .attr('stroke-opacity', '0%');

      this.tempGoalToGoalLineSegs
        .attr('stroke-opacity', '0%');
    }

    if (this.activeElements.includes('Robots')) {
      this.robotsCircles.attr('cx', (d) => d.position.x).attr('cy', (d) => d.position.y)
        .attr('stroke-opacity', '100%')
        .attr('fill-opacity', '100%');
    } else {
      this.robotsCircles
        .attr('stroke-opacity', '0%')
        .attr('fill-opacity', '0%');
    }

    if (this.activeElements.includes('Pucks')) {
      this.pucksCircles.attr('cx', (d) => d.position.x).attr('cy', (d) => d.position.y)
        .attr('stroke-opacity', '100%')
        .attr('fill-opacity', '100%');
    } else {
      this.pucksCircles
        .attr('stroke-opacity', '0%')
        .attr('fill-opacity', '0%');
    }

    if (this.activeElements.includes('Goals')) {
      this.robotToGoalLineSegs.attr('d', (d) => renderLineSeg(d.position.x, d.position.y, d.goal.x, d.goal.y))
        .attr('stroke-opacity', '100%');

      this.goalsCircles.attr('cx', (d) => d.goal.x).attr('cy', (d) => d.goal.y)
        .attr('stroke-opacity', '100%')
        .attr('fill-opacity', '100%');
    } else {
      this.robotToGoalLineSegs.attr('stroke-opacity', '0%');
      this.goalsCircles.attr('stroke-opacity', '0%').attr('fill-opacity', '0%');
    }
  }
}
