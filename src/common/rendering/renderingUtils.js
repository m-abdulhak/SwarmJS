/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

import * as d3 from 'd3';
import { get } from 'lodash';

// eslint-disable-next-line import/no-cycle
import { renderScene } from './renderer';
import { xyPoint } from '../utils/geometry';

let pauseStateOnDragStart = null;

export const getUniqueELementType = (module, type) => `${module} ${type}`;

// Unused for now but useful, so keeping it
const removeElements = (svg, selectionQuery) => {
  let selection = svg.selectAll(selectionQuery).node();
  while (selection) {
    selection.parentNode.remove();
    selection = svg.selectAll(selectionQuery).node();
  }
};

// ----------------- //
// Rendering helpers
// ----------------- //

// Unused for now but useful, so keeping it
const renderLineSeg = (p1, p2) => `M${p1.x},${p1.y}L${p2.x},${p2.y}`;

const renderPath = (points, closed) => {
  const d = points.map((p, i) => {
    const point = xyPoint(p);
    if (i === 0) {
      return `M${point.x},${point.y}`;
    }
    return `L${point.x},${point.y}`;
  });
  return d.join('') + (closed ? 'Z' : '');
};

// ----------------- //
// Parsing helpers
// ----------------- //

const getPropFromObj = (obj, prop, modifier, params) => {
  let parsedVal = get(obj, prop);

  // If a modifier callback is defined
  if (modifier) {
    let func = (val) => val;

    if (typeof modifier === 'function') {
      // If the modifier is a function, use it
      func = modifier;
    } else if (typeof modifier === 'string') {
      // If the modifier is a string, assume it is a function of the object
      func = obj[modifier];
    }

    // Call the modifier function with the parsed value and params
    parsedVal = func(parsedVal, params);
  }

  return parsedVal;
};

const parseAttr = (obj, attr, scene) => {
  // If attr is a string or number, return it
  if (typeof attr === 'number' || typeof attr === 'string') {
    return attr;
  }

  // If attr is an object with a special key, handle it
  if (attr.special) {
    if (attr.special === 'schemaColor') {
      const objIndx = attr.param ? parseAttr(obj, attr.param, scene) : obj.id;
      return d3.schemeCategory10[objIndx % 10];
    }
    return null;
  }

  // If attr is an object with a prop key
  if (attr.prop) {
    const parsedVal = getPropFromObj(obj, attr.prop, attr.modifier, attr.params);
    return parsedVal;
  }

  // If attr is an object with a sceneProp key
  if (attr.sceneProp) {
    const parsedVal = getPropFromObj(scene, attr.sceneProp, attr.modifier, attr.params);
    return parsedVal;
  }

  // Otherwise return null
  // eslint-disable-next-line no-console
  console.log('Invalid attr: ', attr, ' for object: ', obj);
  return null;
};

function setAttrs(attrDef, rends, scene) {
  if (attrDef && typeof attrDef === 'object') {
    Object.keys(attrDef).forEach((attrKey) => {
      const attrValue = attrDef[attrKey];
      if (attrKey === 'text') {
        rends.text((d) => parseAttr(d, attrValue, scene));
      } else {
        rends.attr(attrKey, (d) => parseAttr(d, attrValue, scene));
      }
    });
  }
}

function setDragBehavior(dragDef, rends, scene) {
  if (dragDef && typeof dragDef === 'object') {
    rends.call(d3.drag()
      .on('start', (event, d) => {
        if (dragDef?.pause) {
          pauseStateOnDragStart = scene.paused;
          scene.pause();
        }
        if (dragDef?.onStart?.log) {
          const t = dragDef.onStart.log
            .map((loggingProp) => ([loggingProp.prop, parseAttr(d, loggingProp)]))
            .reduce((acc, [prop, val]) => ({ ...acc, [prop]: val }), {});
          console.log(`${d.constructor.name}-${d.id}: `, t);
        }
        if (dragDef?.onStart?.styles) {
          const styles = dragDef.onStart.styles;
          Object.keys(styles).forEach((attrKey) => {
            const attrValue = styles[attrKey];
            rends.filter((p) => p.id === d.id).raise().attr(attrKey, attrValue);
          });
        }
      })
      .on('drag', (event, d) => {
        if (dragDef?.onDrag?.log) {
          console.log(`${d.id}: `, ...dragDef.onDrag.log.map((prop) => parseAttr(d, prop)));
        }
        // eslint-disable-next-line no-param-reassign
        d[dragDef.prop] = { x: event.x, y: event.y };
        renderScene();
      })
      .on('end', (event, d) => {
        if (dragDef?.pause) {
          if (pauseStateOnDragStart != null && !pauseStateOnDragStart) {
            scene.unpause();
          }
        }
        if (dragDef?.onEnd?.log) {
          console.log(`${d.id}: `, ...dragDef.onEnd.log.map((prop) => parseAttr(d, prop)));
        }
        if (dragDef?.onEnd?.styles) {
          const styles = dragDef.onEnd.styles;
          Object.keys(styles).forEach((attrKey) => {
            const attrValue = styles[attrKey];
            rends.filter((p) => p.id === d.id).raise().attr(attrKey, attrValue);
          });
        }
      }));
  }
}

export function setDynamicAttrs(def, rends, scene) {
  if (!def.dynamicAttrs || typeof def.dynamicAttrs !== 'object') {
    return;
  }

  if (def.shape === 'path') {
    if (def.dynamicAttrs?.points) {
      const getPoints = (d) => {
        if (Array.isArray(def.dynamicAttrs.points)) {
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
          return pointList && Array.isArray(pointList) ? pointList : [];
        }
        return [];
      };

      rends.attr('d', (d) => {
        const points = getPoints(d);
        const renderedPath = renderPath(points, def.shapeParams?.closed);
        return renderedPath;
      });
    } else if (def.dynamicAttrs?.d) {
      rends.attr('d', (d) => parseAttr(d, def.dynamicAttrs.d, scene));
    }
  } else {
    setAttrs(def.dynamicAttrs, rends, scene);
  }
}

export function addRenderables(svg, scene, definitions, module) {
  return definitions.map((def) => {
    // console.log('Adding renderable to : ', svg);
    const rends = def.dataPoints
      ? svg
        .append('g')
        .selectAll(def.shape)
        .data(parseAttr(null, def.dataPoints, scene))
        .enter()
        .append(def.shape)
      : svg.append(def.shape);

    // Add classes to svg elements if defined, useful for debugging
    rends.classed(def.svgClass, true);

    // Add an id to each svg, useful for color scheme selection
    if (!def.staticAttrs?.id) {
      rends.attr('id', (d, i) => i);
    }

    setAttrs(def.styles, rends, scene);
    setAttrs(def.staticAttrs, rends, scene);
    setDynamicAttrs(def, rends, scene);
    setDragBehavior(def.drag, rends, scene);

    return {
      def,
      type: getUniqueELementType(module, def.type),
      values: rends
    };
  });
}
