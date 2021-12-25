/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
import * as d3 from 'd3';
import { get, has } from 'lodash';

import { RobotRenderables } from './robot/robot';
import { nxtCircIndx } from './utils/geometry';

const renderLineSeg = (x1, y1, x2, y2) => `M${x1},${y1}L${x2},${y2}Z`;

const removeElements = (svg, selectionQuery) => {
  let selection = svg.selectAll(selectionQuery).node();
  while (selection) {
    selection.parentNode.remove();
    selection = svg.selectAll(selectionQuery).node();
  }
};

let initialized = false;
let lastSvgEl = null;
let lastScene = null;

const renderingElements = [
  'All', 'Robots', 'Pucks', 'Goals', 'Waypoints', 'VC', 'BVC'
];

const rendrables = {
  Robots: RobotRenderables
};
const renders = [];

let activeElements = [...renderingElements];

export const getRenderingElements = () => [...renderingElements];

export const setElementEnabled = (element, state) => {
  const otherActiveElements = activeElements.filter((e) => e !== element);
  activeElements = state ? [...otherActiveElements, element] : [...otherActiveElements];
};

const renderedElements = {};

export function initialize(svg, scene) {
  if (svg) {
    svg.selectAll('*').remove();
  }
  let pauseStateOnDragStart = null;

  // Buffered voronoi cells line segments (as calculated by robots)
  renderedElements.BVCLineSegs = [];

  // Static Circles
  renderedElements.staticCircles = svg.append('g')
    .selectAll('circle')
    .data(scene.staticObjects.filter((obj) => obj.def.type === 'circle'))
    .enter()
    .append('circle')
    .attr('cx', (d) => d.center.x)
    .attr('cy', (d) => d.center.y)
    .attr('r', (d) => d.radius)
    .attr('fill', '#000000');

  // Static Rectangles
  renderedElements.staticRectangles = svg.append('g')
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
  renderedElements.VcMeshBG = svg.append('path')
    .attr('stroke', '#777')
    .attr('stroke-width', 2)
    .attr('d', voronoiMesh);
  renderedElements.VcMesh = svg.append('path')
    .attr('stroke', '#000')
    .attr('stroke-width', 1)
    .attr('d', voronoiMesh);

  // Temp Goals
  renderedElements.waypointsCircles = svg.append('g')
    .attr('fill-opacity', '40%')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '1,1')
    .selectAll('circle')
    .data(scene.robots)
    .enter()
    .append('circle')
    .attr('cx', (d) => d.waypoint.x)
    .attr('cy', (d) => d.waypoint.y)
    .attr('id', (d) => d.id)
    .attr('r', (d) => d.radius / 1.5)
    .attr('fill', (d, i) => d3.schemeCategory10[i % 10])
    .attr('stroke', (d, i) => d3.schemeCategory10[i % 10]);

  // Line segments between robots and corresponding temp goal
  renderedElements.robotToWaypointLineSegs = svg.append('g')
    .selectAll('path')
    .data(scene.robots)
    .enter()
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', (d, i) => d3.schemeCategory10[i % 10])
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '1,10')
    .attr('d', (d) => renderLineSeg(d.sensors.position.x, d.sensors.position.y, d.waypoint.x, d.waypoint.y));

  // Line segments between each robot's temp goal and goal
  renderedElements.waypointToGoalLineSegs = svg.append('g')
    .selectAll('path')
    .data(scene.robots)
    .enter()
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', (d, i) => d3.schemeCategory10[i % 10])
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '1,10')
    .attr('d', (d) => renderLineSeg(d.waypoint.x, d.waypoint.y, d.goal.x, d.goal.y));

  // Puck Goals
  renderedElements.puckGoalsCircles = svg.append('g')
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
  console.log(rendrables.Robots);
  rendrables.Robots.forEach((def) => {
    const rends = svg.append('g')
      .selectAll(def.shape)
      .data(scene.robots)
      .enter()
      .append(def.shape);

    Object.keys(def.styles).forEach((attrKey) => {
      const attrValue = def.styles[attrKey];
      rends.attr(attrKey, attrValue);
    });

    Object.keys(def.staticAttrs).forEach((attrKey) => {
      const attrValue = def.staticAttrs[attrKey];
      rends.attr(attrKey, (d) => get(d, attrValue));
    });

    Object.keys(def.dynamicAttrs).forEach((attrKey) => {
      const attrValue = def.dynamicAttrs[attrKey];
      rends.attr(attrKey, (d) => get(d, attrValue));
    });

    rends.call(d3.drag()
      .on(
        'start',
        (event, d) => {
          if (def.drag?.pause) {
            pauseStateOnDragStart = scene.paused;
            scene.pause();
          }
          if (def.drag?.onStart?.log) {
            console.log(`${d.id}: `, ...def.drag.onStart.log.map((prop) => get(d, prop)));
          }
          if (has(def, 'drag.onStart.styles')) {
            const styles = def.drag.onStart.styles;
            Object.keys(styles).forEach((attrKey) => {
              const attrValue = styles[attrKey];
              rends.filter((p) => p.id === d.id).raise().attr(attrKey, attrValue);
            });
          }
        }
      )
      .on('drag', (event, d) => {
        if (def.drag?.onDrag?.log) {
          console.log(`${d.id}: `, ...def.drag.onDrag.log.map((prop) => get(d, prop)));
        }
        d[def.drag.prop] = { x: event.x, y: event.y };
        renderScene();
      })
      .on('end', (event, d) => {
        if (def.drag?.pause) {
          if (pauseStateOnDragStart != null && !pauseStateOnDragStart) {
            scene.unpause();
          }
        }
        if (def.drag?.onEnd?.log) {
          console.log(`${d.id}: `, ...def.drag.onEnd.log.map((prop) => get(d, prop)));
        }
        if (has(def, 'drag.onEnd.styles')) {
          const styles = def.drag.onEnd.styles;
          Object.keys(styles).forEach((attrKey) => {
            const attrValue = styles[attrKey];
            rends.filter((p) => p.id === d.id).raise().attr(attrKey, attrValue);
          });
        }
      }));

    renders.push({
      def,
      type: 'Robots',
      values: rends
    });
  });

  // Line segments between robots and corresponding goal
  renderedElements.robotToGoalLineSegs = svg.append('g')
    .selectAll('path')
    .data(scene.robots)
    .enter()
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', (d, i) => d3.schemeCategory10[i % 10])
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '10,10')
    .attr('d', (d) => renderLineSeg(d.sensors.position.x, d.sensors.position.y, d.goal.x, d.goal.y));

  // Line segments between robots and heading
  renderedElements.robotOrientations = svg.append('g')
    .selectAll('path')
    .data(scene.robots)
    .enter()
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', 3)
    .attr('d', (d) => {
      const pos = d.sensors.position;
      const heading = d.sensors.heading;
      return renderLineSeg(pos.x, pos.y, heading.x, heading.y);
    });

  // Goals
  renderedElements.goalsCircles = svg.append('g')
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
        renderedElements.goalsCircles.filter((p) => p.id === d.id).raise().attr('stroke', 'black');
        pauseStateOnDragStart = scene.paused;
        scene.pause();
      })
      .on('drag', (event, d) => {
        d.setGoal({ x: event.x, y: event.y });
        renderScene();
      })
      .on('end', (event, d) => {
        renderedElements.goalsCircles.filter((p) => p.id === d.id).attr('stroke', 'lightgray');
        if (pauseStateOnDragStart != null && !pauseStateOnDragStart) {
          scene.unpause();
        }
      }));

  // Puck
  renderedElements.pucksCircles = svg.append('g')
    .selectAll('circle')
    .data(scene.pucks)
    .enter()
    .append('circle')
    .attr('cx', (d) => d.position.x)
    .attr('cy', (d) => d.position.y)
    .attr('id', (d) => d.id)
    .attr('r', (d) => d.radius)
    .attr('fill', (d) => d.color);

  renderedElements.pucksCircles
    .call(d3.drag()
      .on('start', (event, d) => {
        renderedElements.pucksCircles.filter((p) => p.id === d.id).raise().attr('stroke', 'black');
        pauseStateOnDragStart = scene.paused;
        scene.pause();
        console.log(d);
      })
      .on('drag', (event, d) => {
        d.position = { x: event.x, y: event.y };
        renderScene();
      })
      .on('end', (event, d) => {
        renderedElements.pucksCircles.filter((p) => p.id === d.id).attr('stroke', 'lightgray');
        if (pauseStateOnDragStart != null && !pauseStateOnDragStart) {
          scene.unpause();
        }
      }));

  initialized = true;
}

export function renderScene(curSvgEl, curScene) {
  const svgEl = curSvgEl || lastSvgEl;
  const scene = curScene || lastScene;

  if (!svgEl || !scene) {
    return;
  }

  lastSvgEl = svgEl;
  lastScene = scene;

  const svg = d3.select(svgEl);

  if (!initialized) {
    initialize(svg, scene);
  }

  removeElements(svg, '.bvc-seg');

  renderedElements.BVCLineSegs = [];

  if (!activeElements.includes('All')) {
    return;
  }

  if (activeElements.includes('BVC')) {
    scene.robots.forEach((r, rIndex) => {
      const bVC = r.sensors.BVC;
      if (typeof (bVC) !== 'undefined' && bVC.length > 0) {
        renderedElements.BVCLineSegs.push(
          svg.append('g')
            .selectAll('path')
            .data(bVC)
            .enter()
            .append('path')
            .attr('class', 'bvc-seg')
            .attr('fill', 'none')
            .attr('stroke', () => d3.schemeCategory10[rIndex % 10])
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '10,10')
            .attr('d', (d, i) => renderLineSeg(
              bVC[i][0],
              bVC[i][1],
              bVC[nxtCircIndx(i, bVC.length)][0],
              bVC[nxtCircIndx(i, bVC.length)][1]
            ))
        );
      }
    });
  }

  if (activeElements.includes('VC')) {
    const vcMesh = scene.voronoi.render();
    renderedElements.VcMeshBG
      .attr('d', vcMesh)
      .attr('stroke-opacity', '100%');
    renderedElements.VcMesh
      .attr('d', vcMesh)
      .attr('stroke-opacity', '100%');
  } else {
    renderedElements.VcMeshBG.attr('stroke-opacity', '0%');
    renderedElements.VcMesh.attr('stroke-opacity', '0%');
  }

  if (activeElements.includes('Waypoints')) {
    renderedElements.waypointsCircles
      .attr('cx', (d) => d.waypoint.x)
      .attr('cy', (d) => d.waypoint.y)
      .attr('stroke-opacity', '40%')
      .attr('fill-opacity', '40%');

    renderedElements.robotToWaypointLineSegs
      .attr('d', (d) => renderLineSeg(d.sensors.position.x, d.sensors.position.y, d.waypoint.x, d.waypoint.y))
      .attr('stroke-opacity', '100%');

    renderedElements.waypointToGoalLineSegs
      .attr('d', (d) => renderLineSeg(d.waypoint.x, d.waypoint.y, d.goal.x, d.goal.y))
      .attr('stroke-opacity', '100%');
  } else {
    renderedElements.waypointsCircles
      .attr('stroke-opacity', '0%')
      .attr('fill-opacity', '0%');

    renderedElements.robotToWaypointLineSegs
      .attr('stroke-opacity', '0%');

    renderedElements.waypointToGoalLineSegs
      .attr('stroke-opacity', '0%');
  }

  // Robots
  if (activeElements.includes('Robots')) {
    renders.forEach((render) => {
      Object.keys(render.def.dynamicAttrs).forEach((attrKey) => {
        const attrValue = render.def.dynamicAttrs[attrKey];
        render.values
          .attr(attrKey, (d) => get(d, attrValue))
          .attr('stroke-opacity', render.def.styles['stroke-opacity'] || '100%')
          .attr('fill-opacity', render.def.styles['stroke-opacity'] || '100%');
      });
    });
    renderedElements.robotOrientations
      .attr('d', (d) => {
        const pos = d.sensors.position;
        const heading = d.sensors.heading;
        return renderLineSeg(pos.x, pos.y, heading.x, heading.y);
      });
  } else {
    renders.forEach((render) => {
      render.values
        .attr('stroke-opacity', '0%')
        .attr('fill-opacity', '0%');
    });
    renderedElements.robotOrientations
      .attr('stroke-opacity', '0%')
      .attr('fill-opacity', '0%');
  }

  if (activeElements.includes('Pucks')) {
    renderedElements.pucksCircles.attr('cx', (d) => d.position.x).attr('cy', (d) => d.position.y)
      .attr('stroke-opacity', '100%')
      .attr('fill-opacity', '100%');
  } else {
    renderedElements.pucksCircles
      .attr('stroke-opacity', '0%')
      .attr('fill-opacity', '0%');
  }

  if (activeElements.includes('Goals')) {
    renderedElements.robotToGoalLineSegs.attr('d', (d) => renderLineSeg(d.sensors.position.x, d.sensors.position.y, d.goal.x, d.goal.y))
      .attr('stroke-opacity', '100%');

    renderedElements.goalsCircles.attr('cx', (d) => d.goal.x).attr('cy', (d) => d.goal.y)
      .attr('stroke-opacity', '100%')
      .attr('fill-opacity', '100%');
  } else {
    renderedElements.robotToGoalLineSegs.attr('stroke-opacity', '0%');
    renderedElements.goalsCircles.attr('stroke-opacity', '0%').attr('fill-opacity', '0%');
  }
}

export const resetRenderer = () => {
  initialized = false;
};
