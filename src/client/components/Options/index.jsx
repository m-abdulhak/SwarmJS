import React from 'react';
import propTypes from 'prop-types';

import TitledSlider from '../Inputs/TitledSlider';
import RenderingSettings from './RenderingSettings';

const Options = ({
  renderSkip,
  setRenderSkip,
  renderingElements,
  setElementEnabled
}) => (
  <>
    <TitledSlider
      title='Render Skip'
      value={renderSkip}
      minValue={1}
      maxValue={100}
      setValue={setRenderSkip}
      tooltTip='Number of simulation steps to run between frames, speeds up simulation but can cause app lag.'
    />
    <RenderingSettings
      renderingElements={renderingElements}
      setElementEnabled={setElementEnabled}
    />
  </>
);

Options.propTypes = {
  renderSkip: propTypes.number.isRequired,
  setRenderSkip: propTypes.func.isRequired,
  renderingElements: propTypes.array.isRequired,
  setElementEnabled: propTypes.func.isRequired
};

export default Options;
