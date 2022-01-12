/* eslint-disable no-console */
/* eslint-disable no-restricted-globals */
import Scene from './scene';
import {
  updateBench,
  startBench,
  stopBench,
  getBenchData
} from './benchmarking/benchmark';

// Global Map Memory
const gMaps = [];

let scene;

export const createSimulation = (config, updateCallback) => {
  scene = new Scene(
    config.env,
    config.robots,
    config.pucks.groups,
    config.objects,
    config.algorithm,
    config.positionsGenerator,
    gMaps
  );

  const renderScene = () => {
    if (!scene.paused) {
      scene.update();
      updateBench(scene, scene.timeInstance);
      if (updateCallback && typeof updateCallback === 'function') {
        const benchData = getBenchData();
        updateCallback(scene.timeInstance, scene, benchData);
      }
    }
    requestAnimationFrame(renderScene);
  };
  renderScene();
};

export const simulationIsInitialized = () => scene !== undefined;

export const initSim = (config, updateCallback) => {
  if (scene) {
    return;
  }
  console.log('Creating Sim With Config: ', config);
  createSimulation(config, updateCallback);
};

export const resetSimulation = (config) => {
  scene = new Scene(
    config.env,
    config.robots,
    config.pucks.groups,
    config.objects,
    config.algorithm,
    config.positionsGenerator,
    gMaps
  );
};

export const startBenchmark = (benchConfig, resetSimCB) => {
  const resetSimFunc = resetSimCB && typeof resetSimCB === 'function' ? resetSimCB : resetSimulation;
  startBench(benchConfig, resetSimFunc);
};

export const stopBenchmark = () => stopBench();

export const getBenchmarkData = () => getBenchData();

export const togglePauseSimulation = () => scene.togglePause();

export const setSimulationSpeed = (speed) => scene.setSpeed(speed);

export { AvailableActuators } from './robot/actuators/actuatorsManager';
export { AvailableSensors } from './robot/sensors/sensorManager';
export { default as PositionsGenerator } from './utils/positionsGenerators';
export { default as GraphRenderer } from './benchmarking/graphRenderer';
export { default as PerformanceTrakers } from './benchmarking/performanceTrackers';
export { default as Controllers } from './robot/controllers';
