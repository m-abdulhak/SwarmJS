import React from 'react';
import PropTypes from 'prop-types';

import {
  startBenchmark,
  stopBenchmark
} from '../../swarmjs-core/main';

import GraphContainer from './GraphContainer';

const Benchmark = ({ simConfig, benchSettings, reset, data }) => {
  const graphsContainers = benchSettings.trackers.map((tracker) => {
    const dataSets = data?.history?.[tracker.name];
    const algorithms = dataSets && typeof dataSets === 'object' ? Object.keys(dataSets) : [];
    return (<GraphContainer
      key={tracker.name}
      tracker={tracker}
      data={dataSets}
      aggData={data.aggregates[tracker.name]}
      algorithms={algorithms}
    />);
  });

  return (
    <div id="graph-list" style={{ position: 'absolute', left: '10px' }}>
      <div>
        <input type="button" value="Start Benchmark" style={{ width: '50%' }} onClick={() => startBenchmark(simConfig, benchSettings, reset)}/>
        <input type="button" value="Stop Benchmark" style={{ width: '50%' }} onClick={() => stopBenchmark()}/>
      </div>
      {graphsContainers}
    </div>
  );
};

Benchmark.propTypes = {
  simConfig: PropTypes.object.isRequired,
  benchSettings: PropTypes.object.isRequired,
  reset: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired
};

export default Benchmark;
