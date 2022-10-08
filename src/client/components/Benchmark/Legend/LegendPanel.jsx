import React from 'react';
import PropTypes from 'prop-types';
import { Box, Container } from '@mui/material';
import LegendItem from './LegendItem';

const LegendPanel = ({ algorithms, aggregationType }) => {
  if (!algorithms) {
    return null;
  }
  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
    <Container sx={{ textAlign: 'center' }}>
        {algorithms.map((algorithm, index) => (
          <LegendItem
            key={algorithm}
            index={index}
            algorithmName={algorithm}
            aggregationType={aggregationType}
          />
        ))}
      </Container>
    </Box>
  );
};

LegendPanel.propTypes = {
  algorithms: PropTypes.array.isRequired,
  aggregationType: PropTypes.string
};

export default LegendPanel;
