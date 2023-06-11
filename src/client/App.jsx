/* eslint-disable no-console */
import React, { useState, useRef, useEffect } from 'react';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import {
  stopBenchmark,
  isBenchmarking,
  initializeSimulation,
  simulationIsInitialized,
  resetSimulation,
  togglePauseSimulation,
  setSimulationSpeed,
  setSimulationRenderSkip,
  controllerCodeIsValid
} from '@common';

import {
  renderScene,
  uniqueRenderingElements,
  resetRenderer,
  setElementEnabled,
  toggleElementEnabled,
  createFieldCanvas,
  changeBackgroundField
} from '@common/rendering/renderer';

import QuickActions from './components/QuickActions';
import TabContainer from './components/Layouts/TabContainer';
import Options from './components/Options/index';
import Benchmark from './components/Benchmark';
import CodeEditor from './components/Editors/CodeEditor';

import exampleConfigs from '../scenes';

const options = Object.values(exampleConfigs).map((v) => ({
  label: v.title, value: v.name
}));

const App = () => {
  const [loading, setLoading] = useState(true);
  const [selectedScene, setSelectedScene] = useState(options[0].value);
  const [config, setConfig] = useState(exampleConfigs[selectedScene].simConfig);
  const [benchSettings, setBenchSettings] = useState(exampleConfigs[selectedScene].benchmarkConfig);
  const [description, setDescription] = useState(exampleConfigs[selectedScene].description);
  const [uiEnabled, setUiEnabled] = useState(true);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [renderSkip, setRenderSkip] = useState(1);
  const [paused, setPaused] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState({});
  const svgRef = useRef(null);
  const fieldsElemRef = useRef(null);

  // User Defined Robot Velocity Controller
  const [defaultOnLoopCode, setDefaultOnLoopCode] = useState('');
  const [onLoopCode, setOnLoopCode] = useState(null);
  const [defaultOnInitCode, setDefaultOnInitCode] = useState('');
  const [onInitCode, setOnInitCode] = useState(null);

  const setScene = (newScene) => {
    setSelectedScene(newScene);
  };

  const onSpeedChange = (newSpeed) => {
    const speedNumber = parseFloat(newSpeed);
    setSpeed(speedNumber);
    setSimulationSpeed(speedNumber);
  };

  const onRenderSkipChange = (newRS) => {
    const rs = parseInt(newRS);
    setRenderSkip(rs);
    setSimulationRenderSkip(rs);
  };


  const onUpdate = (newTime, scene, benchData, renderables) => {
    setTime(newTime);
    renderScene(svgRef.current, scene, renderables);
    setBenchmarkData(benchData);
  };

  const reset = (newConfig = config, stopBench = false, useDefaultController = true) => {
    if (stopBench && isBenchmarking()) {
      stopBenchmark();
    }

    // TODO: check for userDefined config and merge
    const usedConfig = { ...newConfig };

    if (!useDefaultController) {
      if (onLoopCode) {
        usedConfig.robots.controllers.velocity.onLoop = onLoopCode;
      }
      if (onInitCode) {
        usedConfig.robots.controllers.velocity.onInit = onInitCode;
      }
    }

    resetSimulation(usedConfig, onUpdate, setDefaultOnLoopCode, setDefaultOnInitCode);
    onSpeedChange(newConfig.env.speed);
    onRenderSkipChange(newConfig.env.renderSkip);
    setPaused(false);
    resetRenderer();

    if (fieldsElemRef?.current) {
      fieldsElemRef.current.innerHTML = '';
    }

    if (newConfig.env.fields && typeof newConfig.env.fields === 'object') {
      for (const [fieldKey, field] of Object.entries(newConfig.env.fields)) {
        if (!field.url) {
          console.error(`Field ${fieldKey} has no url!`);
          return;
        }

        const imageElemOnload = (canvasElem, context) => {
          field.src = context;
          fieldsElemRef?.current?.appendChild(canvasElem);
        };

        createFieldCanvas(fieldKey, field, imageElemOnload);
      }
    }
  };

  const onTogglePause = () => {
    togglePauseSimulation();
    setPaused(!paused);
  };

  useEffect(() => {
    // Initialize the simulation when the component mounts
    initializeSimulation(config, onUpdate);
    setLoading(false);
  }, []);

  useEffect(() => {
    setConfig(exampleConfigs[selectedScene].simConfig);
    setBenchSettings(exampleConfigs[selectedScene].benchmarkConfig);
    setDescription(exampleConfigs[selectedScene].description);
  }, [selectedScene]);

  useEffect(() => {
    reset(config, true);
  }, [config]);

  const initialized = simulationIsInitialized();

  const selectElem = (
    <div id='simulation-selection'>
      <p>Scene: </p>
      <Select
        id='simulation-select'
        name={selectedScene.label}
        value={selectedScene}
        onChange={(event) => {
          setScene(event.target.value);
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

  const optionsElem = initialized ? (
    <Options
      speed={speed}
      setSpeed={onSpeedChange}
      renderSkip={renderSkip}
      setRenderSkip={onRenderSkipChange}
      renderingElements = {uniqueRenderingElements(config.renderables)}
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

  const controllerCodeEditor = initialized ? (
     <CodeEditor
      deploy={() => reset(config, true, false)}
      sections={[
        {
          title: 'Initialize:',
          defaultCode: defaultOnInitCode,
          onCodeValid: setOnInitCode,
          checkIfCodeIsValid: (init) => controllerCodeIsValid(onLoopCode ?? defaultOnLoopCode, init)
        },
        {
          title: 'Loop:',
          defaultCode: defaultOnLoopCode,
          onCodeValid: setOnLoopCode,
          checkIfCodeIsValid: (loop) => controllerCodeIsValid(loop, onInitCode ?? defaultOnInitCode)
        }
      ]}
     />
  ) : <></>;

  const tabContents = [
    { label: 'Options', content: optionsElem },
    { label: 'Configuration', content: configurationsElem },
    { label: 'Benchmark', content: benchElem },
    { label: 'Controller', content: controllerCodeEditor }
  ];

  const ui = uiEnabled ? (
    <TabContainer tabContents={tabContents} />
  ) : <></>;

  const loadingElem = (
      <Box className='loading-screen'>
        <div className='loading-message'>
          <p>Generating Scene</p>
          <CircularProgress color="success" />
        </div>
      </Box>
  );

  return loading ? loadingElem : (
    <div style={{ width: '100%' }}>
      {selectElem}
      <QuickActions
        toggleElementEnabled={toggleElementEnabled}
        setUiEnabled={setUiEnabled}
        uiEnabled={uiEnabled}
        changeBackground={() => changeBackgroundField(fieldsElemRef.current)}
        reset={reset}
        onTogglePause={onTogglePause}
        time={time}
        benchmarkData={benchmarkData}
        simConfig={config}
        benchSettings={benchSettings}
      />
      <div id='env-section' style={{ width: '100%', textAlign: 'center', display: 'flex' }}>
        <div id='env-container' style={{ width: config.env.width, height: config.env.height, flex: '0 0 auto'}}>
          <div id='fields-canvas-container' ref={fieldsElemRef}/>
          <svg id='simulation-svg' ref={svgRef} width={config.env.width} height={config.env.height}/>
        </div>
        <div className='description' style={{ width: '100%', textAlign: 'left', margin: '1%'}}>
          <div dangerouslySetInnerHTML={{ __html: description.html }} />
        </div>
      </div>
      {ui}
    </div>
  );
};

export default App;
