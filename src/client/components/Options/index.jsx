import React from 'react';
import propTypes from 'prop-types';

import SpeedSlider from './SpeedSlider';
import RenderingSettings from './RenderingSettings';

const Options = ({
  speed,
  setSpeed,
  renderingElements,
  setElementEnabled
}) => (
  <>
    <SpeedSlider speed={speed} setSpeed={setSpeed} />
    <RenderingSettings
      renderingElements={renderingElements}
      setElementEnabled={setElementEnabled}
    />
  </>
);

Options.propTypes = {
  speed: propTypes.number.isRequired,
  setSpeed: propTypes.func.isRequired,
  renderingElements: propTypes.array.isRequired,
  setElementEnabled: propTypes.func.isRequired
};

export default Options;
