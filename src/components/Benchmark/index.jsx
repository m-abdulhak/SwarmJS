import React from 'react';
import PropTypes from 'prop-types';

import {
  startBenchmark,
  stopBenchmark
} from '../../swarmjs-core/main';

import GraphContainer from './GraphContainer';

const Benchmark = ({ benchSettings, reset, data }) => {
  const graphsContainers = benchSettings.trackers.map((tracker) => (
      <GraphContainer
        key={tracker.name}
        name={tracker.name}
        title={tracker.title}
        benchSettings={benchSettings}
        data={data.history[tracker.name]}
        aggData={data.aggregates[tracker.name]}
      />
  ));
  return (
    <div id="graph-list" style={{ position: 'absolute', left: '10px' }}>
      <div className="ui-section">
        <input type="button" value="Start Benchmark" className="input-button input small-btn" id="start-benchmark-button" style={{ width: '50%' }} onClick={() => startBenchmark(benchSettings, reset)}/>
        <input type="button" value="Stop Benchmark" className="input-button input small-btn" id="stop-benchmark-button" style={{ width: '50%' }} onClick={() => stopBenchmark()}/>
      </div>
      <div className="ui-section">
        <label className="key">Save Benchmark Image:</label>
        <input type="button" value="Save" className="input-button input small-btn" style={{ width: '50%' }}/>
        <input type="button" value="Auto Save" className="hidden input-button input small-btn" style={{ width: '50%' }}/>
      </div>
      <div>
        {graphsContainers}
      </div>
    </div>
  );
};

Benchmark.propTypes = {
  benchSettings: PropTypes.object.isRequired,
  reset: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired
};

export default Benchmark;
