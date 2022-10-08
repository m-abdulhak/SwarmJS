import React from 'react';
import propTypes from 'prop-types';
import { Box, Grid, Typography, Button } from '@mui/material';

const SimActions = ({
  paused,
  togglePause,
  reset
}) => (
  <Box sx={{ width: '100%', height: '75px' }}>
    <Grid container spacing={2} item sm={12} lg={6} xl={4}>
      <Grid item xs={4} sm={2}>
        <Typography variant="h5">
          Actions
        </Typography>
      </Grid>
      <Grid item xs={4} sm={2}>
        <Button variant={paused ? 'contained' : 'outlined'} onClick={() => togglePause()}>Pause</Button>
      </Grid>
      <Grid item xs={4} sm={2}>
        <Button variant="outlined" onClick={() => reset()}>Reset</Button>
      </Grid>
    </Grid>
  </Box>
);

SimActions.propTypes = {
  paused: propTypes.bool.isRequired,
  togglePause: propTypes.func.isRequired,
  reset: propTypes.func.isRequired
};

export default SimActions;
