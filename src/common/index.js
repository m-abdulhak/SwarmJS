/* eslint-disable no-console */
import { parseFunctionToEditorCode } from './utils/codeParsing';
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

export const resetSimulation = (config, updateCallback, setDefaultControllerCode) => {
  console.log('Creating Sim With Config: ', config);
  const robotControllerConfig = config?.robots?.controllers?.velocity?.controller;

  if (robotControllerConfig && setDefaultControllerCode && typeof setDefaultControllerCode === 'function') {
    const defaultControllerCode = parseFunctionToEditorCode(robotControllerConfig());
    setDefaultControllerCode(defaultControllerCode);
  }

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

export const checkIfControllerIsValid = (controllerCode) => {
  if (!scene?.robots?.length) {
    return { valid: false, error: 'Could not find test robots.' };
  }

  // TODO: this is dangerous as tested code can curropt robot,
  // use a special scene or robot for testing ??
  const res = scene.robots[0].checkIfControllerIsValid(controllerCode);

  return res;
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

export { AvailableActuators as CoreActuators } from './robot/actuators/actuatorsManager';
export { CoreSensors } from './robot/sensors/sensorManager';
export { ExtraSensors } from './robot/sensors/sensorManager';
export { default as CorePositionsGenerators } from './utils/positionsGenerators';
export { default as GraphRenderer } from './benchmarking/graphRenderer';
export { default as CorePerformanceTrakers } from './benchmarking/performanceTrackers';
export { default as CoreControllers } from './robot/controllers';
