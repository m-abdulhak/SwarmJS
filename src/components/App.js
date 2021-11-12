import React from 'react';
import PropTypes from 'prop-types';

import Options from './Options';
import Benchmark from './Benchmark';

import {
  initSimulationIfNeeded,
  getAvailableAlgorithms,
  resetSimulation,
  togglePauseSimulation,
  setSimulationSpeed,
  changeAlgorithm
} from '../swarmjs-core/main';
import {
  renderScene,
  resetRenderer,
  setElementEnabled,
  getRenderingElements
} from '../swarmjs-core/renderer';

const App = ({ config }) => {
  const [time, setTime] = React.useState(0);
  const [speed, setSpeed] = React.useState(1);
  const [paused, setPaused] = React.useState(false);

  const svgRef = React.useRef(null);
  const onUpdate = (newTime, scene) => {
    setTime(newTime);
    renderScene(svgRef.current, scene);
  };
  initSimulationIfNeeded(config, onUpdate);

  const onTogglePause = () => {
    togglePauseSimulation();
    setPaused(!paused);
  };

  const onSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    setSimulationSpeed(newSpeed);
  };

  const reset = () => {
    resetRenderer();
    resetSimulation(config);
    setSimulationSpeed(speed);
  };

  return (
  <div>
    <svg ref={svgRef} width={config.env.width} height={config.env.height} style={{ border: '#bfbebe solid 3px' }}></svg>
    <br/>
    <Options
      togglePause={onTogglePause}
      setSpeed={onSpeedChange}
      reset={reset}
      renderingElements = {getRenderingElements()}
      setElementEnabled={setElementEnabled}
      availableAlgorithms={getAvailableAlgorithms()}
      changeAlgorithm={changeAlgorithm}
      time={time}
    />
    <Benchmark />
  </div>
  );
};

// props validation
App.propTypes = {
  config: PropTypes.object.isRequired
};

export default App;
