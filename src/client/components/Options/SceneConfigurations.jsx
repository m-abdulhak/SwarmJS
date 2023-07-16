import React, { memo } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import TitledInputSection from '../Layouts/TitledInputSection';
import CodeEditorSection from '../Editors/CodeEditor/CodeEditorSection';
import TitledSlider from '../Inputs/TitledSlider';

const paramParser = (type) => {
  switch (type) {
    case 'float':
      return (v) => parseFloat(v);
    case 'int':
      return (v) => parseInt(v);
    default:
      return (v) => v;
  }
};

function SceneConfigurations({
  sceneConfig,
  dynamicParams = {},
  staticParams = {},
  onDynamicPropsChange,
  onStaticPropsChange
}) {
  const dynamicParamElems = (sceneConfig.dynamicPropertyDefinitions || []).map((def) => {
    // eslint-disable-next-line no-unused-vars
    const debouncedChangeHandler = debounce(
      (newV) => onDynamicPropsChange({ [def.name]: paramParser(def.type)(newV) }),
      100
    );

    return (
      <TitledSlider
        className="input-section-header"
        key={def.name}
        title={def.title}
        value={dynamicParams[def.name] ?? 0}
        min={def.min || 0}
        max={def.max || 50}
        step={def.step || 1}
        setValue={(newV) => onDynamicPropsChange({ [def.name]: paramParser(def.type)(newV) })}
        toolTip={def.desc}
      />
    );
  });

  const dynamicConfigurationsElem = dynamicParamElems?.length === 0 ? null : (
    <TitledInputSection title='Dynamic Configurations'>
      {dynamicParamElems}
    </TitledInputSection>
  );

  const staticParamElems = (sceneConfig.staticPropertyDefinitions || []).map((def) => (
    <TitledSlider
      className="input-section-header"
      key={`static-prop-${def.name}`}
      title={def.title}
      value={staticParams[def.name] ?? 0}
      min={def.min || 0}
      max={def.max || 50}
      step={def.step || 1}
      setValue={(newV) => onStaticPropsChange({ [def.name]: paramParser(def.type)(newV) })}
      toolTip={def.desc}
    />
  ));

  const staticConfigurationsElem = staticParamElems?.length === 0 ? null : (
    <TitledInputSection title='Static Configurations (Require Scene Restart)'>
      {staticParamElems}
    </TitledInputSection>
  );

  return (
    <>
      {dynamicConfigurationsElem}
      {staticConfigurationsElem}
      <CodeEditorSection
        title='Full Scene Configurations (Read Only)'
        code={JSON.stringify(sceneConfig, null, 2)}
        setCode={() => {
          // TODO: update current configuration
        }}
        foldAll
        readOnly
      />
      {/* <p> TODO: Change other runtime parameters, simulation configuration, and benchmarking configuration.</p> */}
    </>
  );
}

SceneConfigurations.propTypes = {
  sceneConfig: PropTypes.object.isRequired,
  dynamicParams: PropTypes.object.isRequired,
  staticParams: PropTypes.object.isRequired,
  onDynamicPropsChange: PropTypes.func.isRequired,
  onStaticPropsChange: PropTypes.func.isRequired
};

export default memo(SceneConfigurations);
