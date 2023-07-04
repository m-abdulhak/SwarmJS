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
  setRobotParams as sceneSetRobotParams,
  setSimulationRenderSkip,
  controllerCodeIsValid
} from '@common';

import {
  renderScene,
  uniqueRenderingElements,
  resetRenderer,
  setElementEnabled,
  isElementEnabled,
  createFieldCanvas,
  changeBackgroundField
} from '@common/rendering/renderer';

import QuickActions from './components/QuickActions';
import TabContainer from './components/Layouts/TabContainer';
import Options from './components/Options/index';
import Benchmark from './components/Benchmark';
import CodeEditor from './components/Editors/CodeEditor';
import DebugPanel from './components/Debug';
import TitledSlider from './components/Inputs/TitledSlider';
import CodeEditorSection from './components/Editors/CodeEditor/CodeEditorSection';

import exampleConfigs from '../scenes';

import { getSceneFromUrlQuery } from './utils';

const options = Object.values(exampleConfigs).map((v) => ({
  label: v.title,
  value: v.name
}));

const getDefaultField = (fields) => Object.values(fields || {})
  .find((x) => x.defaultBackground)?.title
  || Object.values(fields || {})?.[0]?.title;

const App = () => {
  const [loading, setLoading] = useState(true);
  const [selectedScene, setSelectedScene] = useState(getSceneFromUrlQuery(options));
  const [config, setConfig] = useState(exampleConfigs[selectedScene].simConfig);
  const [selectedBackgroundField, setSelectedBackgroundField] = useState(getDefaultField(config?.env?.fields) ?? null);
  const [benchSettings, setBenchSettings] = useState(exampleConfigs[selectedScene].benchmarkConfig);
  const [description, setDescription] = useState(exampleConfigs[selectedScene].description);
  const [uiEnabled, setUiEnabled] = useState(false);
  const [time, setTime] = useState(0);
  const [robotParams, setRobotParams] = useState({ velocityScale: 1 });
  const [renderSkip, setRenderSkip] = useState(1);
  const [paused, setPaused] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState({});
  const svgRef = useRef(null);
  const fieldsElemRef = useRef(null);

  useEffect(() => {
    changeBackgroundField(fieldsElemRef.current, selectedBackgroundField);
  }, [fieldsElemRef.current, selectedBackgroundField]);

  // User Defined Robot Velocity Controller
  const [controlerCode, setControlerCode] = useState(
    {
      defaultOnLoopCode: '',
      onLoopCode: null,
      defaultOnInitCode: '',
      onInitCode: null
    }
  );

  const setScene = (newScene) => {
    setSelectedScene(newScene);
  };

  const onRobotParamsChange = ({ velocityScale }) => {
    const v = parseFloat(velocityScale);
    setRobotParams((oldParams) => ({ ...oldParams, velocityScale: v }));
    sceneSetRobotParams(v);
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
      if (controlerCode.onLoopCode) {
        usedConfig.robots.controllers.velocity.onLoop = controlerCode.onLoopCode;
      }
      if (controlerCode.onInitCode) {
        usedConfig.robots.controllers.velocity.init = controlerCode.onInitCode;
      }
    }

    const updateDefaultControlerCode = (init, loop) => setControlerCode(() => {
      const newControlerCode = {
        defaultOnLoopCode: '',
        onLoopCode: null,
        defaultOnInitCode: '',
        onInitCode: null
      };

      if (init) {
        newControlerCode.defaultOnInitCode = init;
      }
      if (loop) {
        newControlerCode.defaultOnLoopCode = loop;
      }
      return newControlerCode;
    });

    resetSimulation(usedConfig, onUpdate, updateDefaultControlerCode);
    onRobotParamsChange({ velocityScale: newConfig?.robots?.params?.velocityScale || 1 });
    onRenderSkipChange(newConfig.env.renderSkip);
    setPaused(false);
    resetRenderer();

    if (fieldsElemRef?.current) {
      fieldsElemRef.current.innerHTML = '';
    }

    if (
      newConfig.env.fields
      && typeof newConfig.env.fields === 'object'
      && Object.keys(newConfig.env.fields).length > 0
    ) {
      for (const [fieldKey, field] of Object.entries(newConfig.env.fields)) {
        if (!field.url) {
          console.error(`Field ${fieldKey} has no url!`);
          return;
        }

        if (!field.title) {
          field.title = fieldKey;
        }

        const imageElemOnload = (canvasElem, context) => {
          field.canvasElem = canvasElem;
          field.context = context;
          fieldsElemRef?.current?.appendChild(canvasElem);
        };

        createFieldCanvas(field, imageElemOnload, selectedBackgroundField);
      }
    }

    setSelectedBackgroundField(getDefaultField(newConfig?.env?.fields) ?? null);
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
    <div id='scene-selection'>
      <p>Scene: </p>
      <Select
        id='scene-select'
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
      renderSkip={renderSkip}
      setRenderSkip={onRenderSkipChange}
      renderingElements = {uniqueRenderingElements(config.renderables)}
      setElementEnabled={setElementEnabled}
    />
  ) : <></>;

  const configurationsElem = (
    <>
      <TitledSlider
        title='Velocity'
        value={robotParams.velocityScale}
        setValue={(newV) => onRobotParamsChange({ velocityScale: newV })}
        tooltTip='Controls robots velocity, only works when supported in robot controller.'
      />
      <CodeEditorSection
        title='Scene Configuration'
        code={JSON.stringify(config, null, 2)}
        setCode={() => {
          // TODO: update current configuration
        }}
        foldAll
      />
      {/* <p> TODO: Change other runtime parameters, simulation configuration, and benchmarking configuration.</p> */}
    </>
  );

  const benchElem = initialized ? (
    <Benchmark simConfig={config} benchSettings={benchSettings} reset={reset} data={benchmarkData}/>
  ) : <></>;

  const controllerCodeEditor = initialized && config?.robots?.controllers?.supportsUserDefinedControllers !== false ? (
     <CodeEditor
      key={controlerCode.defaultOnInitCode}
      deploy={() => reset(config, true, false)}
      sections={[
        {
          title: 'Initialize:',
          defaultCode: controlerCode.defaultOnInitCode,
          onCodeValid: (onInitCode) => setControlerCode((old) => ({ ...old, onInitCode })),
          checkIfCodeIsValid: (init) => controllerCodeIsValid(
            controlerCode.onLoopCode ?? controlerCode.defaultOnLoopCode,
            init
          )
        },
        {
          title: 'Loop:',
          defaultCode: controlerCode.defaultOnLoopCode,
          onCodeValid: (onLoopCode) => setControlerCode((old) => ({ ...old, onLoopCode })),
          checkIfCodeIsValid: (loop) => controllerCodeIsValid(
            loop,
            controlerCode.onInitCode ?? controlerCode.defaultOnInitCode
          )
        }
      ]}
     />
  ) : (
    <p>This scene does not support user defined controllers.</p>
  );

  const tabContents = [
    { label: 'Options', content: optionsElem },
    { label: 'Configuration', content: configurationsElem },
    { label: 'Benchmark', content: benchElem },
    { label: 'Controller', content: controllerCodeEditor },
    {
      label: 'Debug',
      content: (
        <DebugPanel
          title='Scene State'
          getSceneState={() => window.scene}
        />
      )
    }
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

  const sceneDescriptionElem = description?.html ? (
  <div id='scene-description' dangerouslySetInnerHTML={{ __html: description?.html || null }} />
  ) : <></>;

  return loading ? loadingElem : (
    <div style={{ width: '100%' }}>
      {selectElem}
      <QuickActions
        setElementEnabled={setElementEnabled}
        isElementEnabled={isElementEnabled}
        renderSkip={renderSkip}
        setRenderSkip={onRenderSkipChange}
        setUiEnabled={setUiEnabled}
        uiEnabled={uiEnabled}
        changeBackground={(fieldTitle) => {
          setSelectedBackgroundField(fieldTitle);
        }}
        setSelectedBackgroundField={setSelectedBackgroundField}
        availableFields={Object.values(config?.env?.fields || {}).map((field) => field.title)}
        selectedBackgroundField={selectedBackgroundField}
        reset={reset}
        onTogglePause={onTogglePause}
        paused={paused}
        time={time}
        benchmarkData={benchmarkData}
        simConfig={config}
        benchSettings={benchSettings}
      />
      <div id="main-section">
        <div id='env-section'>
          <div id='env-container' style={{ width: config.env.width, height: config.env.height }}>
            <div id='fields-canvas-container' ref={fieldsElemRef}/>
            <svg id='simulation-svg' ref={svgRef} width={config.env.width} height={config.env.height}/>
          </div>
        </div>
        {sceneDescriptionElem}
      </div>
      {ui}
    </div>
  );
};

export default App;
