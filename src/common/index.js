/* eslint-disable no-console */
import Scene from './scene';
import {
  updateBench,
  startBench,
  stopBench,
  getBenchData,
  benchmarkingActive
} from './benchmarking/benchmark';

// Global Map Memory
const gMaps = [];

let scene;
let renderScene;

const createSimulation = (config, updateCallback) => {
  scene = new Scene(
    config.env,
    config.robots,
    config.pucks,
    config.objects,
    config.algorithm,
    config.positionsGenerator,
    gMaps
  );

  renderScene = () => {
    if (!scene.paused) {
      scene.update();
      updateBench(scene, scene.timeInstance);
      if (updateCallback && typeof updateCallback === 'function') {
        const benchData = getBenchData();
        updateCallback(scene.timeInstance, scene, benchData, config.renderables);
      }
    }
    requestAnimationFrame(renderScene);
  };

  renderScene();
};

export const simulationIsInitialized = () => scene !== undefined;

export const initializeSimulation = (config, updateCB) => {
  if (scene) {
    return;
  }
  console.log('Creating Sim With Config: ', config);
  createSimulation(config, updateCB);
};

export const resetSimulation = (config, updateCallback) => {
  console.log('Creating Sim With Config: ', config);
  scene = new Scene(
    config.env,
    config.robots,
    config.pucks,
    config.objects,
    config.algorithm,
    config.positionsGenerator,
    gMaps
  );

  renderScene = () => {
    if (!scene.paused) {
      scene.update();
      updateBench(scene, scene.timeInstance);
      if (updateCallback && typeof updateCallback === 'function') {
        const benchData = getBenchData();
        updateCallback(scene.timeInstance, scene, benchData, config.renderables);
      }
    }
    requestAnimationFrame(renderScene);
  };
};

export const startBenchmark = (simConfig, benchConfig, resetSimCB) => {
  const resetSimFunc = resetSimCB && typeof resetSimCB === 'function' ? resetSimCB : resetSimulation;
  startBench(simConfig, benchConfig, resetSimFunc);
};

export const stopBenchmark = () => stopBench();

export const getBenchmarkData = () => getBenchData();

export const isBenchmarking = () => benchmarkingActive();

export const togglePauseSimulation = () => scene.togglePause();

export const setSimulationSpeed = (speed) => scene.setSpeed(speed);

export const setProgrammingCode = (setup, loop) => scene.setProgrammingCode(setup, loop);

export { AvailableActuators as CoreActuators } from './robot/actuators/actuatorsManager';
export { CoreSensors } from './robot/sensors/sensorManager';
export { ExtraSensors } from './robot/sensors/sensorManager';
export { default as CorePositionsGenerators } from './utils/positionsGenerators';
export { default as GraphRenderer } from './benchmarking/graphRenderer';
export { default as CorePerformanceTrakers } from './benchmarking/performanceTrackers';
export { default as CoreControllers } from './robot/controllers';
