import React from 'react';
import propTypes from 'prop-types';
import { Box, Grid, Slider, Typography } from '@mui/material';

const RenderSkipSlider = ({ renderSkip, setRenderSkip }) => (
  <Box sx={{ width: '100%', height: '75px' }}>
    <Grid container spacing={2} item sm={12} lg={6} xl={4}>
      <Grid item>
        <Typography variant="h6">
          Render Skip
        </Typography>
      </Grid>
      <Grid item xs>
        <Slider
          min={1}
          max={50}
          step={5}
          value={renderSkip}
          valueLabelDisplay='auto'
          onChange={(event, newValue) => setRenderSkip(newValue)}
        />
      </Grid>
    </Grid>
  </Box>
);

RenderSkipSlider.propTypes = {
  renderSkip: propTypes.number.isRequired,
  setRenderSkip: propTypes.func.isRequired
};

export default RenderSkipSlider;
