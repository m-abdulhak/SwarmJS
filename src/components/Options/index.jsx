import React from 'react';
import propTypes from 'prop-types';
import Slider from '../Inputs/Slider';

const Options = ({
  speed,
  togglePause,
  setSpeed,
  reset,
  renderingElements,
  setElementEnabled,
  time
}) => (
  <div>
    <div>
      <label>Time: </label>
      <label>{parseInt(time, 10)}</label>
    </div>
    <div>
      <label>Speed:</label>
      <Slider min={0.1} max={50} step={0.1} val={speed} onChange={setSpeed} />
    </div>
    <div>
      <label>Pause and Reset:</label>
      <input type="button" value="Pause" id="pause-button" onClick={() => togglePause()}/>
      <input type="button" value="Reset" id="reset-button" onClick={() => reset()}/>
    </div>
    <div>
      <label>Rendering:</label>
      {renderingElements.map((element, index) => (
        <div key={index}>
          <input type="checkbox" id={element} defaultChecked onChange={(event) => setElementEnabled(event.target.id, event.target.checked)}/>
          <label htmlFor={element}>{element}</label>
        </div>
      ))}
    </div>
  </div>
);

// props validation
Options.propTypes = {
  speed: propTypes.number.isRequired,
  togglePause: propTypes.func.isRequired,
  setSpeed: propTypes.func.isRequired,
  reset: propTypes.func.isRequired,
  renderingElements: propTypes.array.isRequired,
  setElementEnabled: propTypes.func.isRequired,
  time: propTypes.number
};

export default Options;
