/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
import * as d3 from 'd3';
import { get, has, isArray } from 'lodash';

import { RobotRenderables } from './robot/robot';
import { PuckRenderables } from './puck';
import { nxtCircIndx } from './utils/geometry';

const renderLineSeg = (x1, y1, x2, y2) => `M${x1},${y1}L${x2},${y2}Z`;

const removeElements = (svg, selectionQuery) => {
  let selection = svg.selectAll(selectionQuery).node();
  while (selection) {
    selection.parentNode.remove();
    selection = svg.selectAll(selectionQuery).node();
  }
};

const parseAttr = (obj, attr, scene) => {
  // If attr is a string or number, return it
  if (typeof attr === 'number' || typeof attr === 'string') {
    return attr;
  }

  // If attr is an object with a prop key
  if (has(attr, 'prop')) {
    let parsedVal = get(obj, attr.prop);

    // If a modifier callback is defined and is a function, call it
    if (has(attr, 'modifier') && typeof attr.modifier === 'function') {
      parsedVal = attr.modifier(parsedVal, attr.params);
    }

    // If a modifier is a string, assume it is a function name and call it
    if (typeof attr.modifier === 'string') {
      parsedVal = obj[attr.modifier](parsedVal, attr.params);
    }

    return parsedVal;
  }

  // If attr is an object with a sceneProp key
  if (has(attr, 'sceneProp')) {
    let parsedVal = get(scene, attr.sceneProp);

    // If a modifier callback is defined and is a function, call it
    if (has(attr, 'modifier') && typeof attr.modifier === 'function') {
      parsedVal = attr.modifier(parsedVal, attr.params);
    }

    // If a modifier is a string, assume it is a function name and call it
    // if (typeof attr.modifier === 'string') {
    //   parsedVal = obj[attr.modifier](parsedVal, attr.params);
    // }

    return parsedVal;
  }

  // Otherwise return null
  console.log('Invalid attr: ', attr, ' for object: ', obj);
  return null;
};

let initialized = false;
let lastSvgEl = null;
let lastScene = null;

const renderingElements = [
  'All', 'Robots', 'Pucks', 'Goals', 'Waypoints', 'VC', 'BVC'
];

const rendrables = {
  Pucks: PuckRenderables,
  Robots: RobotRenderables
};
const renders = [];
let pauseStateOnDragStart = null;

let activeElements = [...renderingElements];

const renderedElements = {};

export const getRenderingElements = () => [...renderingElements];

export const setElementEnabled = (element, state) => {
  const otherActiveElements = activeElements.filter((e) => e !== element);
  activeElements = state ? [...otherActiveElements, element] : [...otherActiveElements];
};

function setDynamicAttrs(def, values, scene) {
  if (def.shape === 'circle') {
    Object.keys(def.dynamicAttrs).forEach((attrKey) => {
      const attrVal = def.dynamicAttrs[attrKey];
      values.attr(attrKey, (d) => parseAttr(d, attrVal));
    });
  } else if (
    def.shape === 'path'
    && def.dynamicAttrs.points
    && isArray(def.dynamicAttrs.points)
    && def.dynamicAttrs.points.length === 2
  ) {
    const getPoints = (d) => def.dynamicAttrs.points
      .map((attr) => {
        const parsedPoint = parseAttr(d, attr);
        return {
          ...parsedPoint
        };
      });

    values.attr('d', (d) => {
      const points = getPoints(d);
      return renderLineSeg(
        points[0].x,
        points[0].y,
        points[1].x,
        points[1].y
      );
    });
  } else if (
    def.shape === 'path'
    && has(def, 'dynamicAttrs.d')
  ) {
    values.attr('d', (d) => parseAttr(d, def.dynamicAttrs.d, scene));
  }
}

function addRenderables(svg, scene, definitions, obj) {
  definitions.forEach((def) => {
    const rends = has(def, 'dataPoints')
      ? svg
        .append('g')
        .selectAll(def.shape)
        .data(parseAttr(obj, def.dataPoints, scene))
        .enter()
        .append(def.shape)
      : svg
        .append(def.shape);

    if (has(def, 'styles') && typeof def.styles === 'object') {
      Object.keys(def.styles).forEach((attrKey) => {
        const attrValue = def.styles[attrKey];
        rends.attr(attrKey, (d, i) => {
          if (attrValue === 'RandomColor') {
            return d3.schemeCategory10[i % 10];
          }
          return attrValue;
        });
      });
    }

    if (has(def, 'staticAttrs') && typeof def.staticAttrs === 'object') {
      Object.keys(def.staticAttrs).forEach((attrKey) => {
        const attrValue = def.staticAttrs[attrKey];
        rends.attr(attrKey, (d) => parseAttr(d, attrValue));
      });
    }

    if (!def.staticAttrs?.id) {
      rends.attr('id', (d, i) => i);
    }

    setDynamicAttrs(def, rends, scene);

    if (def.drag && typeof def.drag === 'object') {
      rends.call(d3.drag()
        .on('start', (event, d) => {
          if (def.drag?.pause) {
            pauseStateOnDragStart = scene.paused;
            scene.pause();
          }
          if (def.drag?.onStart?.log) {
            console.log(`${d.id}: `, ...def.drag.onStart.log.map((prop) => parseAttr(d, prop)));
          }
          if (has(def, 'drag.onStart.styles')) {
            const styles = def.drag.onStart.styles;
            Object.keys(styles).forEach((attrKey) => {
              const attrValue = styles[attrKey];
              rends.filter((p) => p.id === d.id).raise().attr(attrKey, attrValue);
            });
          }
        })
        .on('drag', (event, d) => {
          if (def.drag?.onDrag?.log) {
            console.log(`${d.id}: `, ...def.drag.onDrag.log.map((prop) => parseAttr(d, prop)));
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
            console.log(`${d.id}: `, ...def.drag.onEnd.log.map((prop) => parseAttr(d, prop)));
          }
          if (has(def, 'drag.onEnd.styles')) {
            const styles = def.drag.onEnd.styles;
            Object.keys(styles).forEach((attrKey) => {
              const attrValue = styles[attrKey];
              rends.filter((p) => p.id === d.id).raise().attr(attrKey, attrValue);
            });
          }
        }));
    }

    renders.push({
      def,
      type: 'Robots',
      values: rends
    });
  });
}

export function initialize(svg, scene) {
  if (svg) {
    svg.selectAll('*').remove();
  }

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

  // Puck
  addRenderables(svg, scene, rendrables.Pucks);

  // Robots
  addRenderables(svg, scene, rendrables.Robots);

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

  // Robots
  if (activeElements.includes('Robots')) {
    renders.forEach((render) => {
      setDynamicAttrs(render.def, render.values, scene);

      render.values
        .attr('stroke-opacity', render.def.styles['stroke-opacity'] || '100%')
        .attr('fill-opacity', render.def.styles['fill-opacity'] || '100%');
    });
  } else {
    renders.forEach((render) => {
      render.values
        .attr('stroke-opacity', '0%')
        .attr('fill-opacity', '0%');
    });
  }
}

export const resetRenderer = () => {
  initialized = false;
};
