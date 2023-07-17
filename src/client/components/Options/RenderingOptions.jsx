import React, { memo } from 'react';
import propTypes from 'prop-types';

import TitledSlider from '../Inputs/TitledSlider';
import RenderingElements from './RenderingElements';
import TitledInputSection from '../Layouts/TitledInputSection';

const RenderingOptions = ({
  renderSkip,
  setRenderSkip,
  renderingElements,
  setElementEnabled
}) => (
  <>
  <TitledInputSection title='Rendering Options'>
    <TitledSlider
      title='Render Skip'
      value={renderSkip}
      min={1}
      max={100}
      step={1}
      setValue={setRenderSkip}
      toolTip='Number of simulation steps to run between frames, speeds up simulation but can cause app lag.'
    />
  </TitledInputSection>
    <RenderingElements
      renderingElements={renderingElements}
      setElementEnabled={setElementEnabled}
    />
  </>
);

RenderingOptions.propTypes = {
  renderSkip: propTypes.number.isRequired,
  setRenderSkip: propTypes.func.isRequired,
  renderingElements: propTypes.array.isRequired,
  setElementEnabled: propTypes.func.isRequired
};

export default memo(RenderingOptions);
