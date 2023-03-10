/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
import * as d3 from 'd3';
import { addRenderables, setDynamicAttrs, getUniqueELementType } from './renderingUtils';

let resetOnNextRender = false;
let initialized = false;
let lastSvgEl = null;
let lastScene = null;

export const uniqueRenderingElements = (renderables) => ([
  'All',
  ...new Set(
    renderables
      .map((renderable) => renderable.elements.map(
        (def) => getUniqueELementType(renderable.module, def.type)
      ))
      .reduce((acc, curr) => acc.concat(curr), [])
  )
]);

let activeElements = [];

const renderedElems = [];
let background = null;

const setBackground = (svg, scene) => {
  if (scene.background) {
    background = scene.background;
    svg.style('background-image', `url(${background})`);
  } else {
    background = null;
    svg.style('background-image', '');
  }
};

export const setElementEnabled = (element, state) => {
  const otherActiveElements = activeElements.filter((e) => e !== element);
  activeElements = state ? [...otherActiveElements, element] : [...otherActiveElements];
};

export const toggleElementEnabled = (element) => {
  const curState = activeElements.includes(element);
  setElementEnabled(element, !curState);
};

export function initialize(svg, scene, renderables) {
  if (svg) {
    svg.selectAll('*').remove();
  }

  activeElements = [...uniqueRenderingElements(renderables)];

  setBackground(svg, scene);

  renderedElems.length = 0;

  renderables.forEach((renderable) => {
    renderedElems.push(...addRenderables(svg, scene, renderable.elements, renderable.module));
  });

  initialized = true;
}

export function renderScene(curSvgEl, curScene, elements) {
  const svgEl = curSvgEl || lastSvgEl;
  const scene = curScene || lastScene;

  if (!svgEl || !scene) {
    return;
  }

  lastSvgEl = svgEl;
  lastScene = scene;

  const svg = d3.select(svgEl);

  if (scene.background !== background) {
    setBackground(svg, scene);
  }

  if (!initialized) {
    initialize(svg, scene, elements);
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

  if (resetOnNextRender) {
    resetOnNextRender = false;
    initialized = false;
  }
}

export const resetRenderer = () => {
  resetOnNextRender = true;
};
