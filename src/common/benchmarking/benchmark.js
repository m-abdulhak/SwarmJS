import { cloneDeep, merge } from 'lodash';

let historicalData = {};
let aggData = {};
let benchmarking = false;
let curBenchConfIndx = null;
let benchData = {};
let benchSettings = {};
let resetSimCallBack = null;

const getCurConfig = () => benchSettings.simConfigs[curBenchConfIndx];

export const getBenchData = () => {
  const ret = { history: historicalData, aggregates: aggData };
  if (benchmarking) {
    ret.cur = {
      name: getCurConfig().name,
      data: benchData
    };
    // console.log('getBenchData', ret);
  }
  return ret;
};

const resetHistoricalData = () => {
  historicalData = benchSettings.trackers.reduce((acc, tr) => ({
    ...acc,
    [tr.name]: benchSettings.simConfigs
      .reduce((acc2, config) => ({ ...acc2, [config.name]: [] }), {})
  }), {});
  aggData = benchSettings.trackers.reduce((acc, tr) => ({
    ...acc,
    [tr.name]: benchSettings.simConfigs
      .reduce((acc2, config) => ({ ...acc2, [config.name]: [] }), {})
  }), {});
};

const startNewExperiment = () => {
  // Get new config index
  curBenchConfIndx = curBenchConfIndx === null
    ? 0
    : (curBenchConfIndx + 1) % benchSettings.simConfigs.length;
  benchData = {};

  // Reset bench data for all trackers
  benchSettings.trackers.forEach((tracker) => {
    benchData[tracker.name] = {
      data: {},
      curTimeStep: 0,
      curTimeStepValues: []
    };
  });

  resetSimCallBack(getCurConfig().simConfig);
  benchmarking = true;
};

export const startBench = (origSimConfig, newBenchConfig, resetSimCB) => {
  // deep clone origSimConfig for each simConfigs in newBenchConfig
  benchSettings = cloneDeep(newBenchConfig);
  benchSettings.simConfigs = benchSettings.simConfigs.map(({ name, simConfig }) => {
    const newSimConfig = cloneDeep(origSimConfig);
    merge(newSimConfig, simConfig);
    return { name, simConfig: newSimConfig };
  });

  resetSimCallBack = resetSimCB;
  resetHistoricalData();
  curBenchConfIndx = null;
  startNewExperiment();
};

export const benchmarkingActive = () => benchmarking;

export const stopBench = () => {
  benchmarking = false;
  curBenchConfIndx = null;
};

export const updateBench = (scene, time) => {
  // console.log(`Bench: ${scene.timeInstance}ms`, getBenchData());
  if (!benchmarking) {
    return;
  }
  // Update the data for each tracker
  benchSettings.trackers.forEach((tracker) => {
    const trackerTimeStep = benchData[tracker.name].curTimeStep;
    const valuesWithinCurTimeStep = benchData[tracker.name].curTimeStepValues;

    // The timeStep corresponding to the current simulation time
    const curTimeStep = Math.floor(time / benchSettings.timeStep);

    if (curTimeStep === trackerTimeStep) {
      // If new time is still within the current timeStep, add the value to the temporary data
      valuesWithinCurTimeStep.push(tracker.getValue(scene));
    } else {
      // If the new time is not within the current timeStep,
      // aggregate the temporary data and add the resulting value to the currentRun data set
      const newVal = tracker.reduce(valuesWithinCurTimeStep);
      const curRunData = benchData[tracker.name].data;
      curRunData[trackerTimeStep * benchSettings.timeStep] = newVal;

      // Change the current time step and reset the temporary data
      // Add the new value to the temporary data
      benchData[tracker.name].curTimeStep = curTimeStep;
      benchData[tracker.name].curTimeStepValues = [tracker.getValue(scene)];
    }
  });

  if (time >= benchSettings.maxTimeStep) {
    const curConfig = getCurConfig();
    benchSettings.trackers.forEach((tracker) => {
      if (!historicalData[tracker.name]) {
        historicalData[tracker.name] = {};
      }

      if (
        historicalData[tracker.name][curConfig.name]
        && Array.isArray(historicalData[tracker.name][curConfig.name])
      ) {
        historicalData[tracker.name][curConfig.name].push(benchData[tracker.name].data);
      } else {
        historicalData[tracker.name][curConfig.name] = [benchData[tracker.name].data];
      }

      if (!aggData[tracker.name]) {
        aggData[tracker.name] = {};
      }

      const dataSets = historicalData[tracker.name][curConfig.name];
      if (dataSets && dataSets.length > 0) {
        const aggDataSet = Object.keys(dataSets[0])
          .map((key) => ({ [key]: tracker.aggregate(dataSets.map((d) => d[key])) }))
          .reduce((acc, cur) => ({ ...acc, ...cur }), {});

        aggData[tracker.name][curConfig.name] = aggDataSet;
      }
    });
    startNewExperiment();
  }
};
