import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Stack } from '@mui/material';

const TitledInputSection = ({ title, children }) => (
  <Stack className="input-stack-vertical">
    <div className="input-section-header">
      <Typography variant="subtitle1" gutterBottom className="input-section-header-title">
        {title}
      </Typography>
    </div>
    <Stack className="input-stack-vertical">
      {children}
    </Stack>
  </Stack>
);

// Dynamic Configurations

TitledInputSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired
};

export default TitledInputSection;
