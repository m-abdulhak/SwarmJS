/* eslint-disable func-names */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import { TextField, Button, Chip, Stack } from '@mui/material';

import CodeEditorSection from '../Editors/CodeEditor/CodeEditorSection';

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[circular]';
      }
      seen.add(value);
    }

    return value;
  };
};

const stripScene = (scene) => ({
  ...scene,
  engine: undefined,
  world: undefined,
  staticObjects: undefined,
  robots: scene?.robots?.map((robot) => ({
    ...robot,
    scene: undefined,
    engine: undefined,
    world: undefined,
    sensors: { ...(robot?.sensors || {}) },
    sensorManager: undefined,
    actuatorManager: undefined
  })),
  pucks: scene?.pucks?.map((puck) => ({
    ...puck,
    scene: undefined,
    engine: undefined,
    world: undefined,
    sensorManager: undefined,
    actuatorManager: undefined
  }))
});

function DebugPanel({
  title,
  getSceneState
}) {
  const [trackedValues, setTrackedValues] = useState([]);
  const [debugInfo, setDebugInfo] = useState('');
  const [curVal, setCurVal] = useState('');

  const addTrackedValue = () => {
    setTrackedValues((oldTV) => {
      if (oldTV.includes(curVal)) {
        return oldTV;
      }
      return [...oldTV, curVal];
    });
    setCurVal('');
  };

  const trackedValuesElems = trackedValues.map((tv) => (
    <Chip
      key={tv}
      label={tv}
      onDelete={() => {
        setTrackedValues((oldTV) => [...oldTV.filter((t) => t !== tv)]);
      }}
      variant="outlined"
    />
  ));

  return (
    <div>
      <Stack direction="row" spacing={2} className='input-stack-horizontal'>
        <h4>Watched Values</h4>
        <div className="input-group">
          <TextField
            variant="outlined"
            value={curVal}
            onChange={(e) => setCurVal(e.target.value)}
            onKeyDown={(ev) => {
              if (ev.code === 'Space') {
                ev.preventDefault();
              }
              if (ev.key === 'Enter') {
                addTrackedValue();
                ev.preventDefault();
              }
            }}
          />
          <Button
            variant='outlined'
            onClick={addTrackedValue}
          >
            Add
          </Button>
        </div>
        {trackedValuesElems}
      </Stack>
      <CodeEditorSection
        key='DebugPanel'
        title={title}
        setCode={(d) => setDebugInfo(d)}
        code={debugInfo}
        defaultCode=''
        foldAll
        readOnly
        getDefaultCode={() => {
          const sceneState = getSceneState();
          const debugState = trackedValues
            .reduce((acc, cur) => ({ ...acc, [cur]: cloneDeep(get(sceneState, cur)) }), {});

          debugState.scene = stripScene(sceneState);

          return JSON.stringify(debugState, getCircularReplacer(), 2);
        }}
      />
    </div>
  );
}

DebugPanel.propTypes = {
  title: PropTypes.string,
  getSceneState: PropTypes.func
};

export default DebugPanel;
