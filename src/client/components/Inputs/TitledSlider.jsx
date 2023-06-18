import React from 'react';
import propTypes from 'prop-types';
import { Box, Grid, Slider, Typography, Tooltip } from '@mui/material';

const TitledSlider = ({ title, value, setValue, tooltTip, minValue, maxValue }) => (
  <Box sx={{ width: '100%', height: '75px' }}>
    <Grid container spacing={2} item sm={12} lg={10} xl={8}>
      <Grid item sm={3} md={2}>
        <Tooltip title={tooltTip}>
          <Typography variant="h6">
            {title}
          </Typography>
        </Tooltip>
      </Grid>
      <Grid item xs sm={9} md={10}>
        <Slider
          min={minValue || 0}
          max={maxValue || 50}
          step={0.1}
          value={value}
          valueLabelDisplay='auto'
          onChange={(event, newValue) => setValue(newValue)}
        />
      </Grid>
    </Grid>
  </Box>
);

TitledSlider.propTypes = {
  title: propTypes.string.isRequired,
  value: propTypes.number.isRequired,
  minValue: propTypes.number,
  maxValue: propTypes.number,
  setValue: propTypes.func.isRequired,
  tooltTip: propTypes.string
};

export default TitledSlider;
