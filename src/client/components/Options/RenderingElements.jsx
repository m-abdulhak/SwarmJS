import React from 'react';
import propTypes from 'prop-types';
import {
  Grid,
  FormGroup,
  FormControlLabel,
  Switch
} from '@mui/material';

import TitledInputSection from '../Layouts/TitledInputSection';

const RenderingElements = ({ renderingElements, setElementEnabled }) => (
  <TitledInputSection title="Rendering Elements">
    <FormGroup row>
      {renderingElements.map((element, index) => (
        <Grid item xs={4} key={index}>
          <FormControlLabel
            onChange={(event) => setElementEnabled(element, event.target.checked)}
            control={<Switch defaultChecked />}
            label={element}
          />
        </Grid>
      ))}
    </FormGroup>
  </TitledInputSection>
);

RenderingElements.propTypes = {
  renderingElements: propTypes.array.isRequired,
  setElementEnabled: propTypes.func.isRequired
};

export default RenderingElements;
