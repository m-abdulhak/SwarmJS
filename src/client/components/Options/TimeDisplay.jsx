import React from 'react';
import propTypes from 'prop-types';
import { Box, Grid, Typography } from '@mui/material';
import AccessTime from '@mui/icons-material/AccessTime';

const TimeDisplay = ({ time }) => (
  <Box sx={{ width: '100%' }}>
    <Grid container spacing={2}>
      <Grid item>
        <AccessTime />
      </Grid>
      <Grid item>
        <Typography gutterBottom>
          {parseInt(time, 10)}
        </Typography>
      </Grid>
    </Grid>
  </Box>
);

TimeDisplay.propTypes = {
  time: propTypes.number
};

export default TimeDisplay;
