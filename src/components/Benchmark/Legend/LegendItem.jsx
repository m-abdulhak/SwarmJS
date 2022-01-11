import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowMinimize } from '@fortawesome/free-regular-svg-icons';

// TODO: cleanup and change styles based on index according to color scheme

const LegendItem = ({ index, algorithmName, aggregationType }) => (
  <div className='bench_legend_item'>
    <p>{algorithmName}:</p>
    <FontAwesomeIcon className={`svg_color_scheme_${index}`} icon={faWindowMinimize}/>
    <p>{aggregationType}</p>
    <FontAwesomeIcon className={`svg_color_scheme_${index} svg_plot_background`} icon={faWindowMinimize}/>
    <p>Individual</p>
  </div>
);

LegendItem.propTypes = {
  index: PropTypes.number.isRequired,
  algorithmName: PropTypes.string.isRequired,
  aggregationType: PropTypes.string
};

export default LegendItem;
