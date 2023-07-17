import React from 'react';
import propTypes from 'prop-types';
import { Box, Grid, Slider, Typography, Tooltip } from '@mui/material';

const TitledSlider = ({ title, value, setValue, toolTip, min, max, step }) => (
  <Grid container spacing={2} item sm={12} lg={12} xl={12}>
    <Grid item sm={3} md={3} lg={1.5}>
      <Box display="flex" justifyContent="left" alignItems="center">
        <Tooltip title={toolTip}>
          <Typography variant="h7">
            {title}
          </Typography>
        </Tooltip>
      </Box>
    </Grid>
    <Grid item xs sm={9} md={9} lg={10.5} sx={{ maxWidth: '300px' }}>
      <Slider
        min={min || 0}
        max={max || 50}
        step={step || 1}
        value={value}
        valueLabelDisplay='auto'
        onChange={(event, newValue) => setValue(newValue)}
      />
    </Grid>
  </Grid>
);

TitledSlider.propTypes = {
  title: propTypes.string.isRequired,
  value: propTypes.number.isRequired,
  min: propTypes.number,
  max: propTypes.number,
  step: propTypes.number,
  setValue: propTypes.func.isRequired,
  toolTip: propTypes.string
};

export default TitledSlider;
