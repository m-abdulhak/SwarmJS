/* eslint-disable no-console */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

import { get, set, cloneDeep } from 'lodash';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';

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
import RenderingOptions from './components/Options/RenderingOptions';
import Benchmark from './components/Benchmark';
import CodeEditor from './components/Editors/CodeEditor';
import DebugPanel from './components/Debug';
import SceneConfigurations from './components/Options/SceneConfigurations';

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
  const [configWithUserOptions, setConfigWithUserOptions] = useState(config);
  const [selectedBackgroundField, setSelectedBackgroundField] = useState(getDefaultField(config?.env?.fields) ?? null);
  const [benchSettings, setBenchSettings] = useState(exampleConfigs[selectedScene].benchmarkConfig);
  const [description, setDescription] = useState(exampleConfigs[selectedScene].description);
  const [uiEnabled, setUiEnabled] = useState(true);
  const [time, setTime] = useState(0);
  const [dynamicParams, setDynamicParams] = useState({});
  const [staticParams, setStaticParams] = useState({});
  const [renderSkip, setRenderSkip] = useState(1);
  const [paused, setPaused] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState({});
  const svgRef = useRef(null);
  const fieldsElemRef = useRef(null);

  useEffect(() => {
    changeBackgroundField(fieldsElemRef.current, selectedBackgroundField);
  }, [fieldsElemRef.current, selectedBackgroundField]);

  // User Defined Robot Velocity Controller
  const [controllerCode, setControllerCode] = useState(
    {
      defaultOnLoopCode: '',
      onLoopCode: null,
      defaultOnInitCode: '',
      onInitCode: null
    }
  );

  const setScene = (newScene) => {
    setSelectedScene(newScene);
    setDynamicParams({});
    setStaticParams({});
  };

  const onDynamicPropsChange = useCallback((props) => {
    setDynamicParams((oldParams) => {
      const newProps = { ...oldParams, ...props };
      sceneSetRobotParams(newProps);
      resetRenderer();
      return newProps;
    });
  }, []);

  const onStaticPropsChange = useCallback((props) => {
    setStaticParams((oldParams) => ({ ...oldParams, ...props }));
  }, []);

  const onRenderSkipChange = useCallback((newRS) => {
    const rs = parseInt(newRS);
    setRenderSkip(rs);
    setSimulationRenderSkip(rs);
  }, []);

  const uniqueRenderElems = useMemo(() => uniqueRenderingElements(config.renderables), [config.renderables]);

  const onUpdate = (newTime, scene, benchData, renderables) => {
    setTime(newTime);
    renderScene(svgRef.current, scene, renderables);
    setBenchmarkData(benchData);
  };

  const reset = (newConfig = config, stopBench = false, useDefaultController = true) => {
    // TODO: setLoading until scene is initialized
    if (stopBench && isBenchmarking()) {
      stopBenchmark();
    }

    const usedConfig = cloneDeep(newConfig);

    for (const [key, val] of Object.entries(staticParams)) {
      const pDef = (usedConfig.staticPropertyDefinitions || []).find((def) => def.name === key);
      if (val != null && pDef?.path) {
        set(usedConfig, pDef.path, val);
      }
    }

    if (!useDefaultController) {
      if (controllerCode.onLoopCode) {
        usedConfig.robots.controllers.velocity.onLoop = controllerCode.onLoopCode;
      }
      if (controllerCode.onInitCode) {
        usedConfig.robots.controllers.velocity.init = controllerCode.onInitCode;
      }
    }

    const updateDefaultControllerCode = (init, loop) => setControllerCode(() => {
      const newControllerCode = {
        defaultOnLoopCode: '',
        onLoopCode: null,
        defaultOnInitCode: '',
        onInitCode: null
      };

      if (init) {
        newControllerCode.defaultOnInitCode = init;
      }
      if (loop) {
        newControllerCode.defaultOnLoopCode = loop;
      }
      return newControllerCode;
    });

    resetSimulation(usedConfig, onUpdate, updateDefaultControllerCode);

    const defaultDynamicValues = (usedConfig.dynamicPropertyDefinitions || []).reduce((acc, pDef) => {
      let defaultVal = pDef.defaultValue;

      if (defaultVal && typeof defaultVal === 'function') {
        defaultVal = defaultVal(usedConfig);
      }

      acc[pDef.name] = defaultVal;

      return acc;
    }, {});

    onDynamicPropsChange(defaultDynamicValues);

    const defaultStaticValues = (usedConfig.staticPropertyDefinitions || []).reduce((acc, pDef) => {
      acc[pDef.name] = get(usedConfig, pDef.path) ?? pDef.defaultValue;

      return acc;
    }, {});

    onStaticPropsChange(defaultStaticValues);

    onRenderSkipChange(usedConfig.env.renderSkip);
    setPaused(false);
    resetRenderer();

    if (fieldsElemRef?.current) {
      fieldsElemRef.current.innerHTML = '';
    }

    if (
      usedConfig.env.fields
      && typeof usedConfig.env.fields === 'object'
      && Object.keys(usedConfig.env.fields).length > 0
    ) {
      for (const [fieldKey, field] of Object.entries(usedConfig.env.fields)) {
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

    setSelectedBackgroundField(getDefaultField(usedConfig?.env?.fields) ?? null);
    setConfigWithUserOptions(usedConfig);
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
      <a href={`${window.location.origin}${window.location.pathname}?scene=${selectedScene}`}>
        <FontAwesomeIcon
          icon={faLink}
          title="Direct Link to This Scene"
        />
      </a>
    </div>
  );

  const renderingOptionsElem = initialized ? (
    <RenderingOptions
      renderSkip={renderSkip}
      setRenderSkip={onRenderSkipChange}
      renderingElements = {uniqueRenderElems}
      setElementEnabled={setElementEnabled}
    />
  ) : <></>;

  const configurationsElem = <SceneConfigurations
    sceneConfig={configWithUserOptions}
    dynamicParams={dynamicParams}
    onDynamicPropsChange={onDynamicPropsChange}
    staticParams={staticParams}
    onStaticPropsChange={onStaticPropsChange}
  />;

  // TODO: memoize
  const benchElem = initialized ? (
    <Benchmark simConfig={configWithUserOptions} benchSettings={benchSettings} reset={reset} data={benchmarkData}/>
  ) : <></>;

  // TODO: memoize
  const controllerCodeEditor = initialized && config?.robots?.controllers?.supportsUserDefinedControllers !== false ? (
     <CodeEditor
      key={controllerCode.defaultOnInitCode}
      deploy={() => reset(config, true, false)}
      sections={[
        {
          title: 'Initialize:',
          defaultCode: controllerCode.defaultOnInitCode,
          onCodeValid: (onInitCode) => setControllerCode((old) => ({ ...old, onInitCode })),
          checkIfCodeIsValid: (init) => controllerCodeIsValid(
            controllerCode.onLoopCode ?? controllerCode.defaultOnLoopCode,
            init
          )
        },
        {
          title: 'Loop:',
          defaultCode: controllerCode.defaultOnLoopCode,
          onCodeValid: (onLoopCode) => setControllerCode((old) => ({ ...old, onLoopCode })),
          checkIfCodeIsValid: (loop) => controllerCodeIsValid(
            loop,
            controllerCode.onInitCode ?? controllerCode.defaultOnInitCode
          )
        }
      ]}
     />
  ) : (
    <p>This scene does not support user defined controllers.</p>
  );

  const tabContents = [
    { label: 'Rendering', content: renderingOptionsElem },
    { label: 'Configuration', content: configurationsElem },
    { label: 'Benchmark', content: benchElem },
    { label: 'Controller', content: controllerCodeEditor },
    {
      label: 'Debug',
      content: (
        <DebugPanel
          title='Scene State (Read Only)'
          getSceneState={() => window.scene}
        />
      )
    }
  ];

  const sceneDescriptionElem = description?.html ? (
    <div dangerouslySetInnerHTML={{ __html: description?.html }} />
  ) : null;

  if (sceneDescriptionElem) {
    tabContents.unshift({ label: 'About Scene', content: sceneDescriptionElem });
  }

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

  // TODO: memoize, possible split time counter into separate component
  const quickActionsElem = (
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
        simConfig={configWithUserOptions}
        benchSettings={benchSettings}
      />
  );

  return loading ? loadingElem : (
    <div style={{ width: '100%' }}>
      {selectElem}
      {quickActionsElem}
      <div id="main-section">
        <div id='env-section'>
          <div
            id='env-container'
            style={{ width: configWithUserOptions.env.width, height: configWithUserOptions.env.height }}
          >
            <div id='fields-canvas-container' ref={fieldsElemRef}/>
            <svg
              id='simulation-svg'
              ref={svgRef} width={configWithUserOptions.env.width} height={configWithUserOptions.env.height}
            />
          </div>
        </div>
      </div>
      {ui}
    </div>
  );
};

export default App;
