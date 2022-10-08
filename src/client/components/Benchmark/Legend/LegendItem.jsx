import React from 'react';
import PropTypes from 'prop-types';
import TimeLine from '@mui/icons-material/Timeline';
import { Grid, Typography } from '@mui/material';

const LegendItem = ({ index, algorithmName, aggregationType }) => (
  <Grid container spacing={1} justifyContent="center">
    <Grid item>
      <Typography gutterBottom>
        {algorithmName}:
      </Typography>
    </Grid>
    <Grid item>
    </Grid>
    <Grid item>
      <TimeLine className={`svg_color_scheme_${index}`}/>
    </Grid>
    <Grid item>
      <Typography gutterBottom>
      {aggregationType}
      </Typography>
    </Grid>
    <Grid item>
      <TimeLine className={`svg_color_scheme_${index} svg_plot_background`}/>
    </Grid>
    <Grid item>
      <Typography gutterBottom>
      individual
      </Typography>
    </Grid>
  </Grid>
);

LegendItem.propTypes = {
  index: PropTypes.number.isRequired,
  algorithmName: PropTypes.string.isRequired,
  aggregationType: PropTypes.string
};

export default LegendItem;
