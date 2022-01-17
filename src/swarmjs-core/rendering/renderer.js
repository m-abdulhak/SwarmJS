/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
import * as d3 from 'd3';
import { addRenderables, setDynamicAttrs, getUniqueELementType } from './renderingUtils';

import { SceneRenderables } from '../scene';
import { RobotRenderables } from '../robot/robot';
import { PuckRenderables } from '../puck';

let initialized = false;
let lastSvgEl = null;
let lastScene = null;

// All renderables should be registered in this list and assigned a module property
// This is necessary to avoid imposing a unique restriction on renderable type in different modules
// So if both robots and pucks have 'body' type renderables, they can still be treated as separate
// types and be disabled/enabled independently from the UI while also having a readable name
// There could be a cleaner way to do this, but it works for now
// Ordering is also important, as it determines which elements are shown on top
// Elements defined last are shown on top
const renderables = [
  { module: 'Scene', rendList: SceneRenderables },
  { module: 'Puck', rendList: PuckRenderables },
  { module: 'Robot', rendList: RobotRenderables }
];

const uniqueRenderingElements = ['All', ...new Set(renderables
  .map((renderable) => renderable.rendList.map(
    (def) => getUniqueELementType(renderable.module, def.type)
  ))
  .reduce((acc, curr) => acc.concat(curr), []))
];

let activeElements = [...uniqueRenderingElements];

const renderedElems = [];

export const getRenderingElements = () => [...uniqueRenderingElements];

export const setElementEnabled = (element, state) => {
  const otherActiveElements = activeElements.filter((e) => e !== element);
  activeElements = state ? [...otherActiveElements, element] : [...otherActiveElements];
};

export const toggleElementEnabled = (element) => {
  const curState = activeElements.includes(element);
  setElementEnabled(element, !curState);
};

export function initialize(svg, scene) {
  if (svg) {
    svg.selectAll('*').remove();
  }
  renderedElems.length = 0;

  renderables.forEach((renderable) => {
    renderedElems.push(...addRenderables(svg, scene, renderable.rendList, renderable.module));
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

  if (!activeElements.includes('All')) {
    return;
  }

  renderedElems.forEach((element) => {
    if (activeElements.includes(element.type)) {
      setDynamicAttrs(element.def, element.values, scene);

      element.values
        .attr('stroke-opacity', element.def.styles['stroke-opacity'] || '100%')
        .attr('fill-opacity', element.def.styles['fill-opacity'] || '100%');
    } else {
      element.values
        .attr('stroke-opacity', '0%')
        .attr('fill-opacity', '0%');
    }
  });
}

export const resetRenderer = () => {
  initialized = false;
};
