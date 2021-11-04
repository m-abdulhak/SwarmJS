/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
import * as d3 from 'd3';
import Benchmark from './benchmark';
import Scene from './scene';

// Setup
let timeInstance = 0;
let activeElements = {
  All: 1, Robots: 1, Goals: 1, TempGoals: 1, VC: 1, BVC: 1, Collisions: 1
};

// Global Map Memory
const gMaps = [];

// Robots Setup
let numberOfRobots = 20;
let radiusOfRobots = 7;

// Pucks Setup
const pucksGroups = [
  {
    id: 0,
    count: 20,
    radius: 10,
    goal: { x: 150, y: 250 },
    color: 'red'
  },
  {
    id: 1,
    count: 20,
    radius: 10,
    goal: { x: 650, y: 375 },
    color: 'blue'
  }
  // {
  //   id: 2,
  //   count: 20,
  //   radius: 10,
  //   goal: { x: 400, y: 350 },
  //   color: 'green',
  // },
];

// Static Objects
const staticObjectsDefinitions = [
  {
    type: 'rectangle',
    center: { x: 400, y: 100 },
    width: 50,
    height: 225
  },
  {
    type: 'rectangle',
    center: { x: 550, y: 225 },
    width: 350,
    height: 50
  },
  {
    type: 'rectangle',
    center: { x: 750, y: 100 },
    width: 350,
    height: 50
  },
  {
    type: 'circle',
    center: { x: 100, y: 150 },
    radius: 50,
    skipOrbit: true
  },
  // {
  //   type: 'circle',
  //   center: { x: 300, y: 500 },
  //   radius: 50,
  // },
  {
    type: 'rectangle',
    center: { x: 350, y: 425 },
    width: 50,
    height: 150
  },
  {
    type: 'rectangle',
    center: { x: 250, y: 375 },
    width: 250,
    height: 50
  }
];

const uiElements = [
  'speed-slider',
  'robots-slider',
  'reset-button',
  'algo-select',
  'starting-positions-select'
];

const getStartingPositionsSettings = () => {
  const startPositions = parseInt(document.getElementById('starting-positions-select').value, 10);

  switch (startPositions) {
    case 0:
      return 'Random';
    default:
      return 'Random';
  }
};

const getBenchmarkSettings = () => 0;
// {
//   return 0;
//   // return parseInt(document.getElementById('starting-positions-select').value, 10);
// };

// Initializations
const svg = d3.select('svg');
let algorithm = parseInt(document.getElementById('algo-select').value, 10);
let gScene = new Scene(
  svg,
  numberOfRobots,
  radiusOfRobots,
  algorithm,
  activeElements.All,
  getStartingPositionsSettings(),
  pucksGroups,
  staticObjectsDefinitions,
  gMaps
);
let bench = new Benchmark(getBenchmarkSettings());

export const changeAlgorithm = () => {
  // const algo = parseInt(document.getElementById('algo-select').value, 10);
};

export const resetSimulation = () => {
  timeInstance = 0;
  svg.selectAll('*').remove();
  algorithm = parseInt(document.getElementById('algo-select').value, 10);
  gScene = new Scene(
    svg,
    numberOfRobots,
    radiusOfRobots,
    algorithm,
    activeElements.All,
    getStartingPositionsSettings(),
    pucksGroups,
    staticObjectsDefinitions,
    gMaps
  );
  changeAlgorithm();
};

export const changeStartingPositions = () => {
  const startingPositions = parseInt(document.getElementById('starting-positions-select').value, 10);

  switch (startingPositions) {
    case 0:
      radiusOfRobots = 10;
      break;
    default:
      radiusOfRobots = 10;
      break;
  }
  document.getElementById('graph-container').innerHTML = '<div id="graph" class="aGraph" style="display: block;" width="1400" height="600"></div>';

  bench = new Benchmark(getBenchmarkSettings());
};

export const toggleBenchmarking = () => {
  uiElements.forEach((e) => {
    const docEl = document.getElementById(e);
    docEl.disabled = !docEl.disabled;
  });
  bench.setSettings(getBenchmarkSettings());
  bench.curTotalDistanceSet = [];
  bench.curPucksCountSet = [];
  bench.toggleBenchmarking();
};

export const pauseSimulation = () => {
  gScene.togglePause();
};

svg.on('mousemove', () => {
  document.getElementById('mouse-pos').textContent = d3.pointer(this);
});

const elementActive = (id) => document.getElementById(id).classList.contains('active');

export const visualizeElementsChanged = () => {
  document.getElementById(event.srcElement.id).classList.toggle('active');
  activeElements = {
    All: elementActive('redndering-button'),
    Robots: elementActive('robot-button'),
    Goals: elementActive('goal-button'),
    TempGoals: elementActive('tempGoal-button'),
    VC: elementActive('vc-button'),
    BVC: elementActive('bvc-button')
    // Collisions:elementActive("collisions-button")
  };
  gScene.renderingEnabled = activeElements.All;
};

const syncSettings = () => {
  numberOfRobots = document.getElementById('robots-slider').value;
  gScene.setSpeed(document.getElementById('speed-slider').value);
  // document.getElementById("collision-count").textContent = gScene.uniqueCollisions.length
  // + " / " + gScene.totalCollisionTimeInst;
  document.getElementById('time').textContent = timeInstance.toFixed(2);
  document.getElementById('distance').textContent = Math.floor(gScene.distance);
};

const renderScene = () => {
  if (bench.benchmarking && timeInstance > bench.benchMaxTimesteps) {
    bench.startBenchmarkInstance();
  }

  if (!gScene.paused) {
    gScene.update(activeElements);
    timeInstance = gScene.timeInstance;
  }

  bench.updateBenchSet(timeInstance);
  // console.log("TimeInstance: ",timeInstance.toFixed(2), " Distance: ",
  // Math.floor(gScene.distance));

  syncSettings();

  requestAnimationFrame(renderScene);
};

changeAlgorithm();
renderScene();
