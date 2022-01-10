import React from 'react';
import PropTypes from 'prop-types';

// TODO: cleanup and change styles based on index according to color scheme

const LegendItem = ({ index, algorithmName }) => (
  <div className={`legend-item-${index}`} style={{ width: 'fit-content', margin: 'auto' }}>
    <p style={{ display: 'inline-block', marginRight: '20px' }}>{algorithmName}:</p>
    <p style={{
      display: 'inline-block', width: 'fit-content', color: 'midnightblue', margin: '0px', marginRight: '5px', position: 'relative', top: '-12px', fontSize: 'xx-large', fontWeight: 900
    }}>____</p>
    <p style={{ display: 'inline-block', marginRight: '20px' }}>Means</p>
    <p style={{
      display: 'inline-block', width: 'fit-content', color: 'cornflowerblue', marginRight: '5px', position: 'relative', top: '-9px'
    }}>______</p>
    <p style={{ display: 'inline-block', marginRight: '20px' }}>Individual</p>
  </div>
);

LegendItem.propTypes = {
  index: PropTypes.number.isRequired,
  algorithmName: PropTypes.string.isRequired
};

export default LegendItem;
