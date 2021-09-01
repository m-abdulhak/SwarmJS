/* eslint-disable no-restricted-globals */
/* eslint-disable no-use-before-define */
/* eslint-disable func-names */
/* eslint-disable vars-on-top */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-var */
// Matter.js Physics Engine Aliases

// Setup
var timeInstance = 0;
var activeElements = {
  All: 1, Robots: 1, Goals: 1, TempGoals: 1, VC: 1, BVC: 1, Collisions: 1,
};
var paused = false;

// Global Map Memory
var gMaps = [];

// Robots Setup
var numberOfRobots = 20;
var radiusOfRobots = 8;

// Pucks Setup
var pucksGroups = [
  {
    id: 0,
    count: 25,
    radius: 10,
    goal: { x: 150, y: 250 },
    color: 'red',
  },
  {
    id: 1,
    count: 25,
    radius: 10,
    goal: { x: 650, y: 375 },
    color: 'blue',
  },
  {
    id: 2,
    count: 25,
    radius: 10,
    goal: { x: 400, y: 350 },
    color: 'green',
  },
];

// Static Objects
var staticObjectsDefinitions = [
  {
    type: 'rectangle',
    center: { x: 400, y: 100 },
    width: 50,
    height: 225,
  },
  {
    type: 'rectangle',
    center: { x: 550, y: 225 },
    width: 350,
    height: 50,
  },
  {
    type: 'rectangle',
    center: { x: 750, y: 100 },
    width: 350,
    height: 50,
  },
  {
    type: 'circle',
    center: { x: 100, y: 150 },
    radius: 50,
    skipOrbit: true,
  },
  {
    type: 'circle',
    center: { x: 300, y: 500 },
    radius: 150,
  },
];

// Initialize Matter.js objects
var Engine = Matter.Engine;
var World = Matter.World;
var Bodies = Matter.Bodies;
var Body = Matter.Body;

var uiElements = [
  'speed-slider',
  'robots-slider',
  'reset-button',
  'algo-select',
  'starting-positions-select',
];

var getStartingPositionsSettings = function () {
  const startPositions = parseInt(document.getElementById('starting-positions-select').value, 10);

  switch (startPositions) {
    case 0:
      return Scene.StartingPositions.Random;
    default:
      return Scene.StartingPositions.Random;
  }
};

var getBenchmarkSettings = function () {
  return 0;
  // return parseInt(document.getElementById('starting-positions-select').value, 10);
};

// Initializations
var svg = d3.select('svg');
let algorithm = parseInt(document.getElementById('algo-select').value, 10);
var gScene = new Scene(
  svg,
  numberOfRobots,
  radiusOfRobots,
  algorithm,
  activeElements.All,
  getStartingPositionsSettings(),
  pucksGroups,
  staticObjectsDefinitions,
);
var bench = new Benchmark(getBenchmarkSettings());

var resetSimulation = function () {
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
  );
  changeAlgorithm();
};

var changeStartingPositions = function () {
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

var changeAlgorithm = function () {
  // const algo = parseInt(document.getElementById('algo-select').value, 10);

};

var toggleBenchmarking = function () {
  uiElements.forEach((e) => {
    const docEl = document.getElementById(e);
    docEl.disabled = !docEl.disabled;
  });
  bench.setSettings(getBenchmarkSettings());
  bench.curTotalDistanceSet = [];
  bench.curPucksCountSet = [];
  bench.toggleBenchmarking();
};

var pauseSimulation = function () {
  paused = !paused;
};

svg.on('mousemove', function () {
  document.getElementById('mouse-pos').textContent = d3.mouse(this);
});

var visualizeElementsChanged = function () {
  document.getElementById(event.srcElement.id).classList.toggle('active');
  activeElements = {
    All: elementActive('redndering-button'),
    Robots: elementActive('robot-button'),
    Goals: elementActive('goal-button'),
    TempGoals: elementActive('tempGoal-button'),
    VC: elementActive('vc-button'),
    BVC: elementActive('bvc-button'),
    // Collisions:elementActive("collisions-button")
  };
  gScene.renderingEnabled = activeElements.All;
};

var elementActive = function (id) {
  return document.getElementById(id).classList.contains('active');
};

var syncSettings = function () {
  numberOfRobots = document.getElementById('robots-slider').value;
  gScene.setSpeed(document.getElementById('speed-slider').value);
  // document.getElementById("collision-count").textContent = gScene.uniqueCollisions.length
  // + " / " + gScene.totalCollisionTimeInst;
  document.getElementById('time').textContent = timeInstance.toFixed(2);
  document.getElementById('distance').textContent = Math.floor(gScene.distance);
};

var renderScene = function () {
  if (bench.benchmarking && timeInstance > bench.benchMaxTimesteps) {
    bench.startBenchmarkInstance();
  }

  if (!paused) {
    gScene.update(activeElements);
  }

  bench.updateBenchSet(timeInstance);
  // console.log("TimeInstance: ",timeInstance.toFixed(2), " Distance: ",
  // Math.floor(gScene.distance));

  syncSettings();

  requestAnimationFrame(renderScene);
};

changeAlgorithm();
renderScene();
