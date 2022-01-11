import React from 'react';
import PropTypes from 'prop-types';

import LegendItem from './LegendItem';

const LegendPanel = ({ algorithms, aggregationType }) => {
  if (!algorithms) {
    return null;
  }
  return (
      <div>
        {algorithms.map((algorithm, index) => (
          <LegendItem
            key={algorithm}
            index={index}
            algorithmName={algorithm}
            aggregationType={aggregationType}
          />
        ))}
      </div>
  );
};

LegendPanel.propTypes = {
  algorithms: PropTypes.array.isRequired,
  aggregationType: PropTypes.string
};

export default LegendPanel;
