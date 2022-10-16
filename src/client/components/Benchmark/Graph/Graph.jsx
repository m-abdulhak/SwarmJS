import * as d3 from 'd3';

import React from 'react';
import PropTypes from 'prop-types';

import { GraphRenderer } from '@common';

const Graph = ({ graphSettings, data, aggData }) => {
  const [renderer, setRenderer] = React.useState(null);

  if (!data) {
    return null;
  }

  const svgRef = React.useRef(null);
  if (renderer && svgRef && svgRef.current) {
    const svg = d3.select(svgRef.current);
    renderer.updateGraph(svg, data, aggData);
  }

  React.useEffect(() => {
    if (svgRef && svgRef.current) {
      const svg = d3.select(svgRef.current);
      const graphRenderer = new GraphRenderer(svg, graphSettings);
      setRenderer(graphRenderer);
    }
  }, []);

  return (
    <svg width={graphSettings.width} height={graphSettings.height}>
      <g ref={svgRef} transform={`translate(${graphSettings.margin.left}, ${graphSettings.margin.top})`} />
    </svg>
  );
};

Graph.propTypes = {
  graphSettings: PropTypes.object.isRequired,
  data: PropTypes.object,
  aggData: PropTypes.object
};

export default Graph;
