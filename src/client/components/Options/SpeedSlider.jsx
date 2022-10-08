import React from 'react';
import propTypes from 'prop-types';
import { Box, Grid, Slider, Typography } from '@mui/material';

const SpeedSlider = ({ speed, setSpeed }) => (
  <Box sx={{ width: '100%', height: '75px' }}>
    <Grid container spacing={2} item sm={12} lg={6} xl={4}>
      <Grid item>
        <Typography variant="h6">
          Speed
        </Typography>
      </Grid>
      <Grid item xs>
        <Slider
          min={0.1}
          max={50}
          step={0.1}
          value={speed}
          valueLabelDisplay='auto'
          onChange={(event, newValue) => setSpeed(newValue)}
        />
      </Grid>
    </Grid>
  </Box>
);

SpeedSlider.propTypes = {
  speed: propTypes.number.isRequired,
  setSpeed: propTypes.func.isRequired
};

export default SpeedSlider;
