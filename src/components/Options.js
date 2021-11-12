import React from 'react';
import propTypes from 'prop-types';

const Options = ({
  togglePause,
  setSpeed,
  reset,
  renderingElements,
  setElementEnabled,
  availableAlgorithms,
  changeAlgorithm,
  time
}) => (
  <div className="options">
    <div className="ui-section">
      <label className="key">Mouse Position:</label>
      <label className="input-text" id="mouse-pos"></label>
    </div>
    <div className="ui-section">
      <label className="key">Time: </label>
      <label className="input-text" id="time">{parseInt(time, 10)}</label>
    </div>
    <div className="ui-section">
      <label className="key">Puck-Goal Distances: </label>
      <label className="input-text" id="distance"></label>
    </div>
    <div className="ui-section">
      <label className="key">Speed:</label>
      <input type="range" min=".1" max="50.0" defaultValue="15" step=".1" className="slider input" id="speed-slider" onChange={(event) => setSpeed(event.target.value)} />
    </div>
    <div className="ui-section">
      <label className="key">Robots:</label>
      <input type="range" min="1" max="30" defaultValue="20" step="1" className="slider input" id="robots-slider"/>
    </div>
    <div className="ui-section">
      <label className="key">Pause and Reset:</label>
      <input type="button" value="Pause" className="input-button input half-btn" id="pause-button" onClick={() => togglePause()}/>
      <input type="button" value="Reset" className="input-button input half-btn" id="reset-button" onClick={() => reset()}/>
    </div>
    <div className="ui-section">
      <label className="key">Rendering:</label>
      {renderingElements.map((element, index) => (
        <div key={index}>
          <input className='input-button input small-btn' type="checkbox" id={element} defaultChecked onChange={(event) => setElementEnabled(event.target.id, event.target.checked)}/>
          <label className="input-text" htmlFor={element}>{element}</label>
        </div>
      ))}
    </div>
    <div className="ui-section">
      <label className="key">Algorithm:</label>
      <select className="input-select input" id="algo-select" name="deadlock" defaultValue={availableAlgorithms[0].name} onChange={(event) => changeAlgorithm(event.target.value)}>
        {availableAlgorithms.map((algorithm, index) => (
          <option key={index} value={algorithm.id}>{algorithm.name}</option>
        ))}
      </select>
    </div>
    <div className="ui-section">
      <label className="key">Start Benchmarking:</label>
      <input type="button" value="Benchmark" className="input-button input small-btn" id="benchmark-button" style={{ width: '50%' }}/>
    </div>
    <div className="ui-section">
      <label className="key">Save Benchmark Image:</label>
      <input type="button" value="Save" className="input-button input small-btn" style={{ width: '50%' }}/>
      <input type="button" value="Auto Save" className="hidden input-button input small-btn" style={{ width: '50%' }}/>
    </div>
  </div>
);

// props validation
Options.propTypes = {
  togglePause: propTypes.func.isRequired,
  setSpeed: propTypes.func.isRequired,
  reset: propTypes.func.isRequired,
  renderingElements: propTypes.array.isRequired,
  setElementEnabled: propTypes.func.isRequired,
  availableAlgorithms: propTypes.array.isRequired,
  changeAlgorithm: propTypes.func.isRequired,
  time: propTypes.number
};

export default Options;
