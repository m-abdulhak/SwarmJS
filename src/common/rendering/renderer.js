/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
import * as d3 from 'd3';
// eslint-disable-next-line import/no-cycle
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

export const isElementEnabled = (element) => activeElements.includes(element);

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

const getCanvasIdForField = (fieldTitle) => `field-${fieldTitle.split(' ').join('-').toLowerCase()}-canvas`;

export const createFieldCanvas = (field, onLoadCallback, defaultField) => {
  const canvasElem = document.createElement('canvas');
  canvasElem.id = getCanvasIdForField(field.title);
  canvasElem.style.position = 'absolute';
  canvasElem.style.top = 0;
  canvasElem.style.left = 0;

  if (!field.defaultBackground && defaultField !== field.title) {
    canvasElem.classList.add('hidden');
  }

  const context = canvasElem.getContext('2d', { willReadFrequently: true });

  const imageElem = new Image();
  imageElem.src = field.url;

  imageElem.onload = () => {
    canvasElem.width = imageElem.width;
    canvasElem.height = imageElem.height;
    context.drawImage(imageElem, 0, 0);

    if (onLoadCallback && typeof onLoadCallback === 'function') {
      onLoadCallback(canvasElem, context);
    }
  };

  return canvasElem;
};

export const changeBackgroundField = (elem, fieldTitle) => {
  if (!elem) {
    return;
  }

  const children = Array.from(elem.children);
  if (!children?.length) {
    return;
  }

  const curBG = children.findIndex((x) => !x.classList.contains('hidden'));

  let newBG;
  if (fieldTitle != null) {
    newBG = children.findIndex((x) => x.id === getCanvasIdForField(fieldTitle));
  }

  if (!newBG) {
    newBG = (curBG + 1) % children.length;
  }

  if (curBG >= 0) {
    children[curBG].classList.add('hidden');
  }

  if (newBG >= 0) {
    children[newBG].classList.remove('hidden');
  }
};
