import React from 'react';
import propTypes from 'prop-types';

import SpeedSlider from './SpeedSlider';
import RenderSkipSlider from './RenderSkipSlider';
import RenderingSettings from './RenderingSettings';

const Options = ({
  speed,
  setSpeed,
  renderSkip,
  setRenderSkip,
  renderingElements,
  setElementEnabled
}) => (
  <>
    <SpeedSlider speed={speed} setSpeed={setSpeed} />
    <RenderSkipSlider renderSkip={renderSkip} setRenderSkip={setRenderSkip} />
    <RenderingSettings
      renderingElements={renderingElements}
      setElementEnabled={setElementEnabled}
    />
  </>
);

Options.propTypes = {
  speed: propTypes.number.isRequired,
  setSpeed: propTypes.func.isRequired,
  renderSkip: propTypes.number.isRequired,
  setRenderSkip: propTypes.func.isRequired,
  renderingElements: propTypes.array.isRequired,
  setElementEnabled: propTypes.func.isRequired
};

export default Options;
