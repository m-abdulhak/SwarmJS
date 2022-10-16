import React from 'react';
import PropTypes from 'prop-types';
import { Box, Grid, Button } from '@mui/material';

import {
  startBenchmark,
  stopBenchmark,
  isBenchmarking
} from '@common';

const BenchmarkActions = ({ simConfig, benchSettings, reset }) => {
  const btn = !isBenchmarking()
    ? (
      <Grid item xs={8}>
        <Button
          variant='outlined'
          onClick={() => startBenchmark(simConfig, benchSettings, reset)}>
            Start Benchmark
        </Button>
      </Grid>
    )
    : (
      <Grid item xs={8}>
        <Button
          variant='contained'
          onClick={() => stopBenchmark()}>
            Stop Benchmark
        </Button>
      </Grid>
    );

  return (
  <Box sx={{ width: '100%', height: '75px' }}>
    <Grid container spacing={2} item sm={12} lg={6} xl={4}>
      {btn}
    </Grid>
  </Box>
  );
};

BenchmarkActions.propTypes = {
  simConfig: PropTypes.object.isRequired,
  benchSettings: PropTypes.object.isRequired,
  reset: PropTypes.func.isRequired
};

export default BenchmarkActions;
