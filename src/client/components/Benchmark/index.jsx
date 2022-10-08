import React from 'react';
import PropTypes from 'prop-types';

import BenchmarkActions from './BenchmarkActions';
import GraphContainer from './Graph/GraphContainer';

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
    <>
      <BenchmarkActions simConfig={simConfig} benchSettings={benchSettings} reset={reset} />
      {graphsContainers}
    </>
  );
};

Benchmark.propTypes = {
  simConfig: PropTypes.object.isRequired,
  benchSettings: PropTypes.object.isRequired,
  reset: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired
};

export default Benchmark;
