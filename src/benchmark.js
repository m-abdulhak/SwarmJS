/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import * as d3 from 'd3';

const initGraph = (id, maxTimeSteps, xAxixTitle, yAxisTitle, yScale) => {
  const elem = d3.select(id);
  elem.selectAll().remove();

  const graph = {};

  // set the dimensions and margins of the graph
  graph.margin = {
    top: 30,
    right: 30,
    bottom: 80,
    left: 60,
  };
  graph.width = 1400 - graph.margin.left - graph.margin.right;
  graph.height = 600 - graph.margin.top - graph.margin.bottom;

  graph.svg = elem
    .append('svg')
    .attr('width', graph.width + graph.margin.left + graph.margin.right)
    .attr('height', graph.height + graph.margin.top + graph.margin.bottom)
    .append('g')
    .attr('transform',
      `translate(${graph.margin.left}, ${graph.margin.top})`);

  // X scale will fit all values from data[] within pixels 0-width
  graph.x = d3.scaleLinear()
    .domain([0, 1 + maxTimeSteps])
    .range([0, graph.width]);

  graph.svg.append('g')
    .attr('transform', `translate(0,${graph.height})`)
    .call(d3.axisBottom(graph.x));

  // text label for the x axis
  graph.svg.append('text')
    .attr('transform',
      `translate(${graph.width / 2} ,${graph.height + graph.margin.top + 20})`)
    .style('text-anchor', 'middle')
    .text(xAxixTitle);

  // Y scale will fit values within pixels height-0
  graph.y = d3.scaleLinear()
    .domain(yScale)
    .range([graph.height, 0]);

  graph.svg.append('g')
    .call(d3.axisLeft(graph.y));

  // text label for the y axis
  graph.svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - graph.margin.left)
    .attr('x', 0 - (graph.height / 2))
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text(yAxisTitle);

  // const y1 = graph.height - graph.robotRadius * 2;
  // const y2 = graph.height - graph.robotRadius * 2;
  // const x1 = 0;
  // const x2 = 999999;

  // graph.svg.append('path')
  //   .attr('fill', 'none')
  //   .attr('stroke', 'red')
  //   .attr('stroke-width', 1.5)
  //   .attr('stroke-dasharray', '10,10')
  //   .attr('d', `M${x1},${y1}L${x2},${y2}Z`);

  return graph;
};

const createPlot = (graph, color, data, dashed = false, background = false) => graph.svg.append('path')
  .datum(data)
  .attr('fill', 'none')
  .attr('stroke', color)
  // eslint-disable-next-line no-nested-ternary
  .attr('stroke-width', dashed ? 1.5 : (background ? 1 : 5))
  .attr('stroke-dasharray', dashed ? '10,10' : '10,0')
  .attr('d', d3.line().x((d, i) => graph.x(i) * 10).y((d) => graph.y(d)));

const updatePlot = (graph, plot, data) => {
  plot.datum(data).attr('d', d3.line().x((d, i) => graph.x(i) * 10).y((d) => graph.y(d)));
  const el = plot._groups[0][0];
  el.parentNode.appendChild(el);
};

// eslint-disable-next-line no-unused-vars
export default class Benchmark {
  constructor(benchSettings) {
    // Benchmarking
    this.plotColors = {
      1: 'midnightblue',
      2: 'green',
    };
    this.backgroundPlotsColors = {
      1: 'cornflowerblue',
      2: 'darkseagreen',
      3: 'cornflowerblue',
      4: 'darkseagreen',
    };
    this.defaultSettings = [
      // Random:
      {
        type: 'Random',
        benchMaxTimesteps: 25000,
        benchTimeScale: 60,
        benchRobotCount: 25,
        robotRadius: 8,
      },
    ];

    this.setSettings(benchSettings);

    this.benchmarking = false;
    this.bencAlgo = 1;

    this.simpleTotalDistancePlot = null;
    this.simplePucksOutsideGoalCountPlot = null;
    this.advancedTotalDistancePlot = null;
    this.advancedPucksOutsideGoalCountPlot = null;

    this.autoSaveImageAfterEachRep = false;

    // TODO: Add number of pucks to use in init val

    // Create Graphs
    this.totalDistanceGraph = initGraph(
      '#total-distance-graph', this.benchMaxTimesteps, 'Time', 'Total Pucks To Goals Distance', [0, 120],
    );
    this.pucksCountGraph = initGraph(
      '#pucks-count-graph', this.benchMaxTimesteps, 'Time', 'Number of Pucks Outside Goal Areas', [0, 40],
    );

    // Add object containing mean plots that will need to be repeatedly updated
    this.plots = {};
  }

  toggleAutoDownloadImage() {
    this.autoSaveImageAfterEachRep = !this.autoSaveImageAfterEachRep;
  }

  setSettings(benchSettings) {
    this.settings = this.defaultSettings[benchSettings];

    this.benchMaxTimesteps = this.settings.benchMaxTimesteps;
    this.benchTimeScale = this.settings.benchTimeScale;
    this.benchRobotCount = this.settings.benchRobotCount;
    this.robotRadius = this.settings.robotRadius;

    this.benchData = {
      simple: {
        sets: [],
        totalDistanceMeans: [],
        puckCountMeans: [],
      },
      advanced: {
        sets: [],
        totalDistanceMeans: [],
        puckCountMeans: [],
      },
    };

    this.curTotalDistanceSet = [];
    this.curPucksCountSet = [];
  }

  fillUnchangedBenchSet(indx) {
    const valAtZeroIndx = this.curTotalDistanceSet[0];
    this.curTotalDistanceSet[0] = valAtZeroIndx === undefined ? 0 : valAtZeroIndx;

    let lastDefinedIndex = indx;
    while (lastDefinedIndex > 0 && this.curTotalDistanceSet[lastDefinedIndex] === undefined) {
      lastDefinedIndex -= 1;
    }

    const lastVal = this.curTotalDistanceSet[lastDefinedIndex];

    while (lastDefinedIndex <= indx) {
      this.curTotalDistanceSet[lastDefinedIndex] = lastVal;
      lastDefinedIndex += 1;
    }

    // TODO: replace 10000 with suitable pucks count
    this.curPucksCountSet[0] = valAtZeroIndx === undefined ? 10000 : valAtZeroIndx;

    lastDefinedIndex = indx;
    while (lastDefinedIndex > 0 && this.curPucksCountSet[lastDefinedIndex] === undefined) {
      lastDefinedIndex -= 1;
    }

    const lastPuckCountVal = this.curPucksCountSet[lastDefinedIndex];

    while (lastDefinedIndex <= indx) {
      this.curPucksCountSet[lastDefinedIndex] = lastPuckCountVal;
      lastDefinedIndex += 1;
    }
  }

  updateBenchSet(time) {
    if (this.benchmarking) {
      const newIndx = Math.floor(time / 10);

      this.fillUnchangedBenchSet(newIndx - 1);

      this.curTotalDistanceSet[newIndx] = gScene.distance;
      this.curPucksCountSet[newIndx] = gScene.pucksOutsideGoalCount;

      // if (this.curPucksCountSet[Math.floor((time + 3) / 10)] === undefined) {
      //   gScene.minDistance = null;
      // }
    }
  }

  toggleBenchmarking() {
    this.benchmarking = !this.benchmarking;
    document.getElementById('benchmark-button').classList.toggle('active');

    if (this.benchmarking) {
      this.startBenchmarkInstance();
    }
  }

  startBenchmarkInstance() {
    this.updateBenchData();

    document.getElementById('speed-slider').value = this.benchTimeScale;
    document.getElementById('robots-slider').value = this.benchRobotCount;
    syncSettings();

    this.benchAlgo = this.benchAlgo === 1 ? 2 : 1;
    // this.benchAlgo = 2;

    const selectElement = (id, valueToSelect) => {
      const element = document.getElementById(id);
      element.value = valueToSelect;
    };

    selectElement('algo-select', this.benchAlgo);

    resetSimulation();
  }

  updateBenchData() {
    const correctDataSetLength = (2 + Math.floor(this.benchMaxTimesteps / 10));
    const dataSetLengthIsValid = this.curTotalDistanceSet.length === correctDataSetLength;

    if (this.benchmarking && dataSetLengthIsValid) {
      const data = this.benchAlgo === 1 ? this.benchData.simple : this.benchData.advanced;

      if (data.totalDistanceMeans.length === 0) {
        data.totalDistanceMeans = this.curTotalDistanceSet;
        data.puckCountMeans = this.curPucksCountSet;
      } else {
        const setCount = data.sets.length;
        const newMeans = [];
        const newPuckCountMeans = [];

        for (let i = 0; i < data.totalDistanceMeans.length; i += 1) {
          const newMeansTotal = data.totalDistanceMeans[i] * setCount + this.curTotalDistanceSet[i];
          newMeans[i] = newMeansTotal / (setCount + 1);
          const newMinDistTotal = data.puckCountMeans[i] * setCount + this.curPucksCountSet[i];
          newPuckCountMeans[i] = newMinDistTotal / (setCount + 1);
        }

        data.totalDistanceMeans = newMeans;
        data.puckCountMeans = newPuckCountMeans;
      }

      this.updateGraphs(
        this.totalDistanceGraph,
        this.benchAlgo,
        data.totalDistanceMeans,
        this.curTotalDistanceSet,
        'totalDistance',
      );

      this.updateGraphs(
        this.pucksCountGraph,
        this.benchAlgo,
        data.puckCountMeans,
        this.curPucksCountSet,
        'PuckCounts',
      );

      data.sets.push(this.curTotalDistanceSet);
      if (this.autoSaveImageAfterEachRep) {
        this.downloadImages(data.sets.length);
      }
    }

    this.curTotalDistanceSet = [];
    this.curPucksCountSet = [];
  }

  updateGraphs(graph, algo, means, newSet, plotName) {
    this.updateGraph(graph, `${plotName}-${algo}-Means`, algo, means, newSet);
  }

  updateGraph(graph, meansPlotName, algo, meansSet, newSet) {
    createPlot(graph, this.backgroundPlotsColors[algo], newSet, false, true);

    if (this.plots[meansPlotName] == null) {
      this.plots[meansPlotName] = createPlot(
        graph, this.plotColors[algo], meansSet,
      );
    } else {
      updatePlot(
        graph, this.plots[meansPlotName], meansSet,
      );
    }
  }

  downloadImages(reps = null) {
    this.downloadImage('total-distance-graph', reps);
    this.downloadImage('pucks-count-graph', reps);
  }

  downloadImage(graphId, reps = null) {
    const repsSec = reps == null ? '' : `__Reps-${reps}`;
    const fileN = `Benchmark_${this.settings.type}${repsSec}__Steps-${this.settings.benchMaxTimesteps}__Robots-${this.settings.benchRobotCount}__Radius-${this.settings.robotRadius}__Env-${gScene.width}-${gScene.height}`;
    saveSvgAsPng(document.getElementById(graphId).children[0], `${fileN}.png`, { scale: 5 });
  }
}
