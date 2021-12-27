/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
import * as d3 from 'd3';
import { get, has, isArray } from 'lodash';

import { RobotRenderables } from './robot/robot';
import { PuckRenderables } from './puck';
import { xyPoint } from './utils/geometry';

const renderLineSeg = (p1, p2) => `M${p1.x},${p1.y}L${p2.x},${p2.y}`;

const renderPath = (points) => {
  const d = points.map((p, i) => {
    const point = xyPoint(p);
    if (i === 0) {
      return `M${point.x},${point.y}`;
    }
    return `L${point.x},${point.y}`;
  });
  return d.join('');
};

const renderClosedPath = (points) => renderPath(points).concat('Z');

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

  // If attr is an object with a special key, handle it
  if (attr.special) {
    if (attr.special === 'schemaColor') {
      const objIndx = attr.param ? parseAttr(obj, attr.param, scene) : obj.i;
      return d3.schemeCategory10[objIndx % 10];
    }
    return null;
  }

  // If attr is an object with a prop key
  if (attr.prop) {
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
  if (attr.sceneProp) {
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

const rendrables = [
  PuckRenderables,
  RobotRenderables
];

const renders = [];
let pauseStateOnDragStart = null;

let activeElements = [...renderingElements];

const renderedElements = {};

export const getRenderingElements = () => [...renderingElements];

export const setElementEnabled = (element, state) => {
  const otherActiveElements = activeElements.filter((e) => e !== element);
  activeElements = state ? [...otherActiveElements, element] : [...otherActiveElements];
};

function setDynamicAttrs(def, rends, scene) {
  if (def.shape === 'circle') {
    Object.keys(def.dynamicAttrs).forEach((attrKey) => {
      const attrVal = def.dynamicAttrs[attrKey];
      rends.attr(attrKey, (d) => parseAttr(d, attrVal));
    });
  } else if (def.shape === 'path' && def.dynamicAttrs?.points) {
    const getPoints = (d) => {
      if (isArray(def.dynamicAttrs.points)) {
        return def.dynamicAttrs.points
          .map((attr) => {
            const parsedPoint = parseAttr(d, attr);
            return {
              ...parsedPoint
            };
          });
      }
      if (def.dynamicAttrs.points.prop) {
        const pointList = parseAttr(d, def.dynamicAttrs.points);
        return pointList && isArray(pointList) ? pointList : [];
      }
      return [];
    };

    rends.attr('d', (d) => {
      const points = getPoints(d);
      const renderedPath = def.shapeParams === 'closed' ? renderClosedPath(points) : renderPath(points);
      return renderedPath;
    });
  } else if (
    def.shape === 'path'
    && has(def, 'dynamicAttrs.d')
  ) {
    rends.attr('d', (d) => parseAttr(d, def.dynamicAttrs.d, scene));
  }
}

function setStyles(def, rends, scene) {
  if (has(def, 'styles') && typeof def.styles === 'object') {
    Object.keys(def.styles).forEach((attrKey) => {
      const attrValue = def.styles[attrKey];
      rends.attr(attrKey, (d, i) => parseAttr({ ...d, i }, attrValue, scene));
    });
  }
}

function addRenderables(svg, scene, definitions) {
  definitions.forEach((def) => {
    const rends = has(def, 'dataPoints')
      ? svg
        .append('g')
        .selectAll(def.shape)
        .data(parseAttr(null, def.dataPoints, scene))
        .enter()
        .append(def.shape)
      : svg
        .append(def.shape);

    setStyles(def, rends, scene);

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
      type: def.type,
      values: rends
    });
  });
}

export function initialize(svg, scene) {
  if (svg) {
    svg.selectAll('*').remove();
  }

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

  rendrables.forEach((renderable) => {
    addRenderables(svg, scene, renderable);
  });

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

  if (!activeElements.includes('All')) {
    return;
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
