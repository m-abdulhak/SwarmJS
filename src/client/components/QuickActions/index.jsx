import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDrawPolygon, faImage, faSync, faCog, faPause, faClock, faStopwatch, faPlay
} from '@fortawesome/free-solid-svg-icons';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { countValidDataSets } from '@common/benchmarking/graphRenderingUtils';

import {
  startBenchmark,
  stopBenchmark,
  isBenchmarking
} from '@common';

const renderSkipOptions = [1, 5, 10, 25, 50];

const getNextRenderSkipOption = (cur) => {
  const idx = renderSkipOptions.indexOf(cur);

  if (cur === 'Off' || idx === -1) {
    return renderSkipOptions[0];
  }

  if (idx === renderSkipOptions.length - 1) {
    return 'Off';
  }

  return renderSkipOptions[idx + 1] ?? renderSkipOptions[0];
};

const QuickActions = ({
  setElementEnabled,
  isElementEnabled,
  renderSkip,
  setRenderSkip,
  changeBackground,
  availableFields,
  selectedBackgroundField,
  setUiEnabled,
  uiEnabled,
  reset,
  onTogglePause,
  paused,
  time,
  benchmarkData,
  simConfig,
  benchSettings
}) => {
  const benchRuns = !benchmarkData.history
    ? 0
    : countValidDataSets(Object.values(benchmarkData.history)[0], {});

  const backgroundFieldSelectorElem = selectedBackgroundField ? (
    <>
      <Select
        id='field-background-select'
        className='quick-actions-select'
        name='field-background-select'
        title='Change Background'
        value={selectedBackgroundField}
        onChange={(event) => {
          changeBackground(event.target.value);
        }}
        IconComponent={(prs) => {
          const propsNoFlip = { ...prs, className: `${prs.className} icon-no-flip` };
          return (
            <FontAwesomeIcon
              icon={faImage}
              title="Change Background"
              {...propsNoFlip}
            />
          );
        }}
      >
        {availableFields?.map((option) => (
              <MenuItem key={option} value={option}>
                {option.label ?? option}
              </MenuItem>
        ))}
      </Select>
    </>
  ) : null;

  const renderingEnabled = isElementEnabled('All');

  const renderingOptionsElem = (
    <>
      <FontAwesomeIcon
        icon={faDrawPolygon}
        className={`quick-actions-icon ${renderingEnabled ? 'green-action-btn' : ''}`}
        title="Number of Simulation Steps Per Frame (Off: Disable Rendering)"
        onClick={() => {
          const newRenderOption = getNextRenderSkipOption(renderSkip);

          if (newRenderOption === 'Off') {
            setElementEnabled('All', false);
            setRenderSkip(51);
          } else {
            setElementEnabled('All', true);
            setRenderSkip(newRenderOption);
          }
        }}
      />
      <p
        className="quick-actions-icon"
        title="Number of Simulation Steps Per Frame"
        style={{ width: '22px' }}
      >
        { !renderingEnabled || !renderSkip ? 'Off' : renderSkip}
      </p>
    </>
  );

  return (
    <div id='quick-actions'>
      {backgroundFieldSelectorElem}
      <FontAwesomeIcon
        icon={faCog}
        className={`quick-actions-icon ${uiEnabled ? 'green-action-btn' : ''}`}
        title="Toggle Configuration Panels"
        onClick={() => setUiEnabled(!uiEnabled)}
      />
      <FontAwesomeIcon
        icon={faSync}
        className="quick-actions-icon"
        title="Reset Simulation"
        onClick={() => reset()}
      />
      <FontAwesomeIcon
        icon={paused ? faPlay : faPause}
        className="quick-actions-icon"
        title="Pause / Resume"
        onClick={() => onTogglePause()}
      />
      {renderingOptionsElem}
      <FontAwesomeIcon
        icon={faStopwatch}
        className={`quick-actions-icon ${isBenchmarking() ? 'green-action-btn' : ''}`}
        title="Toggle Benchmark"
        onClick={() => {
          if (isBenchmarking()) {
            stopBenchmark();
          } else {
            startBenchmark(simConfig, benchSettings, reset);
          }
        }
      }
      />
      <p
        className="quick-actions-icon"
        title="Benchmark Runs"
      >
        {benchRuns}
      </p>
      <FontAwesomeIcon
        icon={faClock}
        className="quick-actions-icon"
        title="Simulation Time"
      />
      <p
        className="quick-actions-icon"
        title="Simulation Time"
      >
        {parseInt(time, 10)}
      </p>
    </div>
  );
};

QuickActions.propTypes = {
  setElementEnabled: PropTypes.func.isRequired,
  isElementEnabled: PropTypes.func.isRequired,
  renderSkip: PropTypes.number,
  setRenderSkip: PropTypes.func.isRequired,
  changeBackground: PropTypes.func.isRequired,
  availableFields: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedBackgroundField: PropTypes.string,
  setUiEnabled: PropTypes.func.isRequired,
  uiEnabled: PropTypes.bool.isRequired,
  reset: PropTypes.func.isRequired,
  onTogglePause: PropTypes.func.isRequired,
  paused: PropTypes.bool.isRequired,
  time: PropTypes.number.isRequired,
  benchmarkData: PropTypes.object.isRequired,
  simConfig: PropTypes.object.isRequired,
  benchSettings: PropTypes.object.isRequired
};

export default QuickActions;
