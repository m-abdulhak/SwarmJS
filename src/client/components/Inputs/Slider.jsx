import React from 'react';
import propTypes from 'prop-types';

const Slider = ({ min, max, step, val, onChange }) => (
    <input
      type="range"
      min={min}
      max={max}
      value={val}
      step={step}
      onChange={(event) => onChange(event.target.value)}
    />
);

Slider.propTypes = {
  min: propTypes.number,
  max: propTypes.number,
  step: propTypes.number,
  val: propTypes.number.isRequired,
  onChange: propTypes.func.isRequired
};

export default Slider;
