/* eslint-disable no-console */
/* eslint-disable no-restricted-globals */
import Scene from './scene';

// Global Map Memory
const gMaps = [];

let scene;

export const createSimulation = (config, updateCallback) => {
  console.log('Main config: ', config);

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
    // if (bench.benchmarking && timeInstance > bench.benchMaxTimesteps) {
    //   bench.startBenchmarkInstance();
    // }

    if (!scene.paused) {
      scene.update();
      if (updateCallback && typeof updateCallback === 'function') {
        updateCallback(scene.timeInstance, scene);
      }
    }

    // bench.updateBenchSet(timeInstance);
    // console.log("TimeInstance: ",timeInstance.toFixed(2), " Distance: ",
    // Math.floor(scene.distance));

    requestAnimationFrame(renderScene);
  };

  renderScene();
};

export const initSimulationIfNeeded = (config, updateCallback) => {
  if (scene) {
    return;
  }
  createSimulation(config, updateCallback);
};

export const resetSimulation = (config) => {
  scene = new Scene(
    config.env,
    config.robots,
    config.pucks.groups,
    config.objects,
    config.algorithm,
    gMaps
  );
};

export const togglePauseSimulation = () => {
  scene.togglePause();
};

export const setSimulationSpeed = (speed) => {
  scene.setSpeed(speed);
};

export const getAvailableAlgorithms = () => scene.availableAlgorithms;

export const changeAlgorithm = (algorithm) => {
  scene.changeAlgorithm(algorithm);
};

export default initSimulationIfNeeded;
