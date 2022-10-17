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
    {/* <SimActions reset={reset} paused={paused} togglePause={togglePause} /> */}
    {/* <TimeDisplay time={time} /> */}
    <SpeedSlider speed={speed} setSpeed={setSpeed} />
    <RenderingSettings
      renderingElements={renderingElements}
      setElementEnabled={setElementEnabled}
    />
  </>
);

Options.propTypes = {
  speed: propTypes.number.isRequired,
  paused: propTypes.bool.isRequired,
  togglePause: propTypes.func.isRequired,
  setSpeed: propTypes.func.isRequired,
  reset: propTypes.func.isRequired,
  renderingElements: propTypes.array.isRequired,
  setElementEnabled: propTypes.func.isRequired,
  time: propTypes.number
};

export default Options;
