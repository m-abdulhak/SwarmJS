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

// Robots Setup
var numberOfRobots = 20;
var radiusOfRobots = 10;

// Pucks Setup
var pucksGroups = [
  {
    id: 0,
    count: 20,
    radius: 13,
    goal: { x: 150, y: 250 },
    color: 'red',
  },
  {
    id: 1,
    count: 20,
    radius: 13,
    goal: { x: 650, y: 250 },
    color: 'blue',
  },
  {
    id: 2,
    count: 20,
    radius: 13,
    goal: { x: 400, y: 350 },
    color: 'green',
  },
];

// Static Objects
var staticObjectsDefinitions = [
  {
    type: 'circle',
    center: { x: 350, y: 350 },
    radius: 50,
  },
  {
    type: 'circle',
    center: { x: 650, y: 170 },
    radius: 50,
  },
  {
    type: 'circle',
    center: { x: 450, y: 150 },
    radius: 50,
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
  'algorithm-select',
  'deadlock-select',
  'starting-positions-select',
];

var getStartingPositionsSettings = function () {
  const startPositions = parseInt(document.getElementById('starting-positions-select').value, 10);

  switch (startPositions) {
    case 0:
      return Scene.StartingPositions.Random;
    case 1:
      return Scene.StartingPositions.Circle;
    case 2:
      return Scene.StartingPositions.InvertedSquare;
    case 3:
      return Scene.StartingPositions.InvertedSquare2;
    default:
      return Scene.StartingPositions.Random;
  }
};

var getBenchmarkSettings = function () {
  return parseInt(document.getElementById('starting-positions-select').value, 10);
};

// Initializations
var svg = d3.select('svg');
let motionPlanningAlgorithm = parseInt(document.getElementById('algorithm-select').value, 10);
var gScene = new Scene(
  svg,
  numberOfRobots,
  radiusOfRobots,
  motionPlanningAlgorithm,
  activeElements.All,
  getStartingPositionsSettings(),
  pucksGroups,
  staticObjectsDefinitions,
);
var bench = new Benchmark(getBenchmarkSettings());

var resetSimulation = function () {
  timeInstance = 0;
  svg.selectAll('*').remove();
  motionPlanningAlgorithm = parseInt(document.getElementById('algorithm-select').value, 10);
  gScene = new Scene(
    svg,
    numberOfRobots,
    radiusOfRobots,
    motionPlanningAlgorithm,
    activeElements.All,
    getStartingPositionsSettings(),
    pucksGroups,
    staticObjectsDefinitions,
  );
  changeDeadlockAlgorithm();
};

var changeStartingPositions = function () {
  const startingPositions = parseInt(document.getElementById('starting-positions-select').value, 10);

  switch (startingPositions) {
    case 0:
      radiusOfRobots = 10;
      document.getElementById('robots-slider').max = 150;
      document.getElementById('robots-slider').value = 100;
      break;
    case 1:
      radiusOfRobots = 3;
      document.getElementById('robots-slider').max = 100;
      document.getElementById('robots-slider').value = 100;
      break;
    case 2:
      radiusOfRobots = 5;
      document.getElementById('robots-slider').max = 100;
      document.getElementById('robots-slider').value = 100;
      break;
    case 3:
      radiusOfRobots = 5;
      document.getElementById('robots-slider').max = 100;
      document.getElementById('robots-slider').value = 100;
      break;
    default:
      radiusOfRobots = 10;
      break;
  }
  document.getElementById('graph-container').innerHTML = '<div id="graph" class="aGraph" style="display: block;" width="1400" height="600"></div>';

  bench = new Benchmark(getBenchmarkSettings());
};

var changeDeadlockAlgorithm = function () {
  const deadlockAlgorithm = parseInt(document.getElementById('deadlock-select').value, 10);
  gScene.robots.forEach((r) => {
    r.setDeadlockAlgo(deadlockAlgorithm);
  });
};

var toggleBenchmarking = function () {
  uiElements.forEach((e) => {
    const docEl = document.getElementById(e);
    docEl.disabled = !docEl.disabled;
  });
  bench.setSettings(getBenchmarkSettings());
  bench.curTotalDistanceSet = [];
  bench.curMinDistanceSet = [];
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

changeDeadlockAlgorithm();
renderScene();
