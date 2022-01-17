import React from 'react';
import PropTypes from 'prop-types';

import Options from './Options/index';
import Benchmark from './Benchmark';

import {
  initializeSimulation,
  simulationIsInitialized,
  resetSimulation,
  togglePauseSimulation,
  setSimulationSpeed
} from '../swarmjs-core';

import {
  renderScene,
  resetRenderer,
  setElementEnabled,
  getRenderingElements
} from '../swarmjs-core/rendering/renderer';

const App = ({ config, benchSettings }) => {
  const [time, setTime] = React.useState(0);
  const [speed, setSpeed] = React.useState(1);
  const [paused, setPaused] = React.useState(false);
  const [benchmarkData, setBenchmarkData] = React.useState({});
  const svgRef = React.useRef(null);

  const onSpeedChange = (newSpeed) => {
    const speedNumber = parseFloat(newSpeed);
    setSpeed(speedNumber);
    setSimulationSpeed(speedNumber);
  };

  const reset = (newConfig = config) => {
    resetRenderer();
    resetSimulation(newConfig);
    onSpeedChange(newConfig.env.speed);
  };

  const onUpdate = (newTime, scene, benchData) => {
    setTime(newTime);
    renderScene(svgRef.current, scene);
    setBenchmarkData(benchData);
  };

  const onTogglePause = () => {
    togglePauseSimulation();
    setPaused(!paused);
  };

  React.useEffect(() => {
    // Initialize the simulation when the component mounts
    initializeSimulation(config, onUpdate);
  }, []);

  const initialized = simulationIsInitialized();

  const optionsElem = initialized ? (
    <Options
      speed={speed}
      togglePause={onTogglePause}
      setSpeed={onSpeedChange}
      reset={reset}
      renderingElements = {getRenderingElements()}
      setElementEnabled={setElementEnabled}
      time={time}
    />
  ) : null;

  const benchElem = initialized ? (
    <Benchmark simConfig={config} benchSettings={benchSettings} reset={reset} data={benchmarkData}/>
  ) : null;

  return (
  <div>
    <svg ref={svgRef} width={config.env.width} height={config.env.height} style={{ border: '#bfbebe solid 3px' }}></svg>
    <br/>
    {optionsElem}
    {benchElem}
  </div>
  );
};

// props validation
App.propTypes = {
  config: PropTypes.object.isRequired,
  benchSettings: PropTypes.object.isRequired
};

export default App;
