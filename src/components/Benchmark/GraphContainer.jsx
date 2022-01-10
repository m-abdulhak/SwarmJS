import React from 'react';
import PropTypes from 'prop-types';
import Graph from './Graph';
import LegendPanel from './Legend/LegendPanel';

const GraphContainer = ({ name, title, benchSettings, data }) => {
  if (!data) {
    return null;
  }

  return (
    <div id={`${name}-graph-container`} style={{
      margin: 'auto', width: '1400px', padding: '10px', border: 'solid 1px black'
    }}>
      <div style={{ width: 'fit-content', margin: 'auto' }}>
        <p style={{ fontWeight: 900 }}>{title}</p>
      </div>
      <Graph benchSettings={benchSettings} data={data}/>
      <LegendPanel algorithms={benchSettings.configs} />
    </div>
  );
};

GraphContainer.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  benchSettings: PropTypes.object,
  data: PropTypes.object
};

export default GraphContainer;
