import React from 'react';
import PropTypes from 'prop-types';
import Graph from './Graph';
import LegendPanel from './Legend/LegendPanel';

const GraphContainer = (
  { tracker, data, aggData, algorithms }
) => {
  if (!data) {
    return null;
  }

  return (
    <div className='graph-container'>
      <div className='graph-title'>
        <p>{tracker.title}</p>
      </div>
      <Graph data={data} aggData={aggData} graphSettings={tracker.graphSettings}/>
      <LegendPanel algorithms={algorithms} aggregationType={tracker.aggregationType} />
    </div>
  );
};

GraphContainer.propTypes = {
  tracker: PropTypes.object.isRequired,
  data: PropTypes.object,
  aggData: PropTypes.object,
  algorithms: PropTypes.array
};

export default GraphContainer;
