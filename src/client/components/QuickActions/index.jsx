import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDrawPolygon, faImage, faSync, faCog, faPause, faClock, faStopwatch } from '@fortawesome/free-solid-svg-icons';
import { countValidDataSets } from '@common/benchmarking/graphRenderingUtils';

import {
  startBenchmark,
  stopBenchmark,
  isBenchmarking
} from '@common';

const QuickActions = ({
  toggleElementEnabled,
  changeBackground,
  setUiEnabled,
  uiEnabled,
  reset,
  onTogglePause,
  time,
  benchmarkData,
  simConfig,
  benchSettings
}) => {
  const benchRuns = !benchmarkData.history
    ? 0
    : countValidDataSets(Object.values(benchmarkData.history)[0], {});

  return (
    <div id='quick-actions'>
      <FontAwesomeIcon
        icon={faDrawPolygon}
        className="quick-actions-icon"
        title="Toggle Rendering"
        onClick={() => toggleElementEnabled('All')}
      />
      <FontAwesomeIcon
        icon={faImage}
        className="quick-actions-icon"
        title="Change Background"
        onClick={() => changeBackground()}
      />
      <FontAwesomeIcon
        icon={faCog}
        className="quick-actions-icon"
        title="Toggle UI"
        onClick={() => setUiEnabled(!uiEnabled)}
      />
      <FontAwesomeIcon
        icon={faSync}
        className="quick-actions-icon"
        title="Reset Simulation"
        onClick={() => reset()}
      />
      <FontAwesomeIcon
        icon={faPause}
        className="quick-actions-icon"
        title="Pause / Resume"
        onClick={() => onTogglePause()}
      />
      <FontAwesomeIcon
        icon={faStopwatch}
        className="quick-actions-icon"
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
  toggleElementEnabled: PropTypes.func.isRequired,
  changeBackground: PropTypes.func.isRequired,
  setUiEnabled: PropTypes.func.isRequired,
  uiEnabled: PropTypes.bool.isRequired,
  reset: PropTypes.func.isRequired,
  onTogglePause: PropTypes.func.isRequired,
  time: PropTypes.number.isRequired,
  benchmarkData: PropTypes.object.isRequired,
  simConfig: PropTypes.object.isRequired,
  benchSettings: PropTypes.object.isRequired
};

export default QuickActions;
