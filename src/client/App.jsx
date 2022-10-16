import React, { useState, useRef, useEffect } from 'react';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import QuickActions from './components/QuickActions';
import TabContainer from './components/Layouts/TabContainer';
import Options from './components/Options/index';
import Benchmark from './components/Benchmark';

import exampleConfigs from '../scenes';
import {
  stopBenchmark,
  isBenchmarking,
  initializeSimulation,
  simulationIsInitialized,
  resetSimulation,
  togglePauseSimulation,
  setSimulationSpeed
} from '@common';

import {
  renderScene,
  resetRenderer,
  setElementEnabled,
  toggleElementEnabled,
  getRenderingElements
} from '@common/rendering/renderer';

const options = Object.values(exampleConfigs).map((v) => ({
  label: v.title, value: v.name
}));

const App = () => {
  const [selectedScene, setSelectedScene] = useState(options[0].value);
  const [config, setConfig] = useState(exampleConfigs[selectedScene].simConfig);
  const [benchSettings, setBenchSettings] = useState(exampleConfigs[selectedScene].benchmarkConfig);
  const [uiEnabled, setUiEnabled] = useState(false);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState({});
  const svgRef = useRef(null);

  const handleChange = (value) => {
    setSelectedScene(value);
  };

  const selectElem = (
    <div id='simulation-selection'>
      <p>Simulation: </p>
      <Select
        id='simulation-select'
        name={selectedScene.label}
        value={selectedScene}
        onChange={(event) => {
          handleChange(event.target.value);
        }}
      >
        {options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label ?? option.value}
              </MenuItem>
        ))}
      </Select>
    </div>
  );

  const onSpeedChange = (newSpeed) => {
    const speedNumber = parseFloat(newSpeed);
    setSpeed(speedNumber);
    setSimulationSpeed(speedNumber);
  };

  const reset = (newConfig = config, stopBench = false) => {
    if (stopBench && isBenchmarking()) {
      stopBenchmark();
    }
    resetRenderer();
    resetSimulation(newConfig);
    onSpeedChange(newConfig.env.speed);
    setPaused(false);
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

  useEffect(() => {
    // Initialize the simulation when the component mounts
    initializeSimulation(config, onUpdate);
  }, []);

  useEffect(() => {
    setConfig(exampleConfigs[selectedScene].simConfig);
    setBenchSettings(exampleConfigs[selectedScene].benchmarkConfig);
  }, [selectedScene]);

  useEffect(() => {
    reset(config, true);
  }, [config]);

  const initialized = simulationIsInitialized();

  const optionsElem = initialized ? (
    <Options
      time={time}
      speed={speed}
      paused={paused}
      togglePause={onTogglePause}
      setSpeed={onSpeedChange}
      reset={reset}
      renderingElements = {getRenderingElements()}
      setElementEnabled={setElementEnabled}
    />
  ) : <></>;

  // TODO: Add a TreeView component to set Simulation and Benchmarking options
  const configurationsElem = (
    <p> TODO: Tree View UI for Changing Simulation and Benchmarking Configuration </p>
  );

  const benchElem = initialized ? (
    <Benchmark simConfig={config} benchSettings={benchSettings} reset={reset} data={benchmarkData}/>
  ) : <></>;

  const tabContents = [
    { label: 'Options', content: optionsElem },
    { label: 'Configurations', content: configurationsElem },
    { label: 'Benchmarking', content: benchElem }
  ];

  const ui = uiEnabled ? (
    <TabContainer tabContents={tabContents} />
  ) : <></>;

  return (
    <div style={{ width: '100%' }}>
      {selectElem}
      <QuickActions
        toggleElementEnabled={toggleElementEnabled}
        setUiEnabled={setUiEnabled}
        uiEnabled={uiEnabled}
        reset={reset}
        onTogglePause={onTogglePause}
        time={time}
        benchmarkData={benchmarkData}
        simConfig={config}
        benchSettings={benchSettings}
        />
      <div style={{ width: '100%', textAlign: 'center' }}>
        <svg
          ref={svgRef}
          width={config.env.width}
          height={config.env.height}
          style={{ border: '#bfbebe solid 3px' }}
        />
      </div>
      {ui}
    </div>
  );
};

export default App;
