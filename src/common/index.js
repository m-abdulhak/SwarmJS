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
  console.log('Initializing Sim With Config: ', config);
  createSimulation(config, updateCB);
};

export const resetSimulation = (
  config,
  updateCallback,
  updateDefaultControllerCode
) => {
  console.log('Resetting Sim With Config: ', config);
  const velocityController = config?.robots?.controllers?.velocity?.controller;
  const velocityControllerInit = config?.robots?.controllers?.velocity?.init;

  let defaultOnInitCode = velocityControllerInit;
  if (defaultOnInitCode && typeof defaultOnInitCode === 'function') {
    defaultOnInitCode = parseFunctionToEditorCode(defaultOnInitCode);
  }

  let defaultOnLoopCode;
  if (velocityController && typeof velocityController === 'function') {
    defaultOnLoopCode = parseFunctionToEditorCode(
      velocityController({}, {}, config?.robots?.controllers?.velocity?.onLoop)
    );
  }

  if (updateDefaultControllerCode && typeof updateDefaultControllerCode === 'function') {
    updateDefaultControllerCode(defaultOnInitCode, defaultOnLoopCode);
  }

  // THE CODE BELOW IS ALMOST IDENTICAL TO createSimulation.  YET IF WE INSERT
  // THE FOLLOWING INSTEAD:
  //     createSimulation(config, updateCallback);
  // AN ISSUE ARISES.
  scene = new Scene(
    config.env,
    config.robots,
    config.pucks,
    config.objects,
    config.algorithm,
    config.positionsGenerator,
    gMaps,
    config.dynamicPropertyDefinitions
  );

  // Make scene globally available if running in browser.
  // This is useful for debugging.
  if (window) {
    window.scene = scene;
  }

  renderScene = () => {
    if (!scene.paused) {
      for (let i = 0; i < scene.renderSkip; i += 1) {
        scene.update();
        updateBench(scene, scene.timeInstance);
      }

      if (updateCallback && typeof updateCallback === 'function') {
        const benchData = getBenchData();
        updateCallback(scene.timeInstance, scene, benchData, config.renderables);
      }
    }
    requestAnimationFrame(renderScene);
  };
};

export const controllerCodeIsValid = (loopCode, initCode) => {
  if (!scene?.robots?.length) {
    return { valid: false, error: 'Scene does not have any robots to verify code.' };
  }

  // TODO: this is dangerous as tested code can corrupt robot,
  // use a special scene or robot for testing ??
  const res = scene.robots[0].controllerCodeIsValid(loopCode, initCode);

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

export const setRobotParams = (params) => scene.setRobotParams(params);

export const setSimulationRenderSkip = (rs) => scene.setRenderSkip(rs);

export { AvailableActuators as CoreActuators } from './robot/actuators/actuatorsManager';
export { CoreSensors } from './robot/sensors/sensorManager';
export { ExtraSensors } from './robot/sensors/sensorManager';
export { default as CorePositionsGenerators } from './utils/positionsGenerators';
export { default as GraphRenderer } from './benchmarking/graphRenderer';
export { default as CorePerformanceTrackers } from './benchmarking/performanceTrackers';
export { default as CoreControllers } from './robot/controllers';
export { default as defaultDynamicPropertyDefinitions } from './configurationTemplate/dynamicPropertyDefinitions';
export { default as defaultStaticPropertyDefinitions } from './configurationTemplate/staticPropertyDefinitions';
