import React from 'react';
import propTypes from 'prop-types';
import {
  Box,
  Grid,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch
} from '@mui/material';

const RenderingSettings = ({ renderingElements, setElementEnabled }) => (
  <Box sx={{ width: '100%' }}>
    <FormGroup row>
      <Grid container spacing={2} item sm={12} lg={6} xl={4}>
        <Grid item xs={12}>
          <Typography variant="h5">
            Rendering
          </Typography>
        </Grid>
        {renderingElements.map((element, index) => (
          <Grid item xs={4} key={index}>
            <FormControlLabel
              onChange={(event) => setElementEnabled(element, event.target.checked)}
              control={<Switch defaultChecked />}
              label={element}
            />
          </Grid>
        ))}
      </Grid>
    </FormGroup>
  </Box>
);

RenderingSettings.propTypes = {
  renderingElements: propTypes.array.isRequired,
  setElementEnabled: propTypes.func.isRequired
};

export default RenderingSettings;
