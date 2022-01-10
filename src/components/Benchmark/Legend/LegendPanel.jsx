import React from 'react';
import PropTypes from 'prop-types';

import LegendItem from './LegendItem';

const LegendPanel = ({ algorithms }) => {
  if (!algorithms) {
    return null;
  }
  return (
      <div>
        {algorithms.map((algorithm, index) => (
          <LegendItem
            key={algorithm.name}
            index={index}
            algorithmName={algorithm.name}
          />
        ))}
      </div>
  );
};

LegendPanel.propTypes = {
  algorithms: PropTypes.array.isRequired
};

export default LegendPanel;
