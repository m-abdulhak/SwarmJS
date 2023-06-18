import React, { useState } from 'react';
import PropTypes from 'prop-types';

import CodeEditorSection from '../Editors/CodeEditor/CodeEditorSection';

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
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
  const [debugInfo, setDebugInfo] = useState('');

  return (
    <CodeEditorSection
      key='DebugPanel'
      title={title}
      setCode={(d) => setDebugInfo(d)}
      code={debugInfo}
      defaultCode=''
      foldAll
      getDefaultCode={() => JSON.stringify(stripScene(getSceneState()), getCircularReplacer(), 2)}
    />
  );
}

DebugPanel.propTypes = {
  title: PropTypes.string,
  getSceneState: PropTypes.func
};

export default DebugPanel;
