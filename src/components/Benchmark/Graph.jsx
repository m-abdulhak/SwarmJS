import * as d3 from 'd3';

import React from 'react';
import PropTypes from 'prop-types';

const getLineKey = (alogName, index) => `${alogName}-${index}`;

const outsideDomain = (domain, value) => value < domain[0] || value > domain[1];

const getDataSetsCount = (data) => Object.values(data)
  .reduce((count, dataSets) => count + dataSets.length, 0);

const shouldUpdatePlots = (plottedLines, data) => {
  const dataSetsCount = getDataSetsCount(data);
  const plottedLinesCount = Object.keys(plottedLines).length;
  return dataSetsCount > plottedLinesCount;
};

const getDomains = (data) => {
  const timeIntervals = Object.keys(Object.values(data)[0][0]);

  const xMinMax = [timeIntervals[0], timeIntervals[timeIntervals.length - 1]];
  const yMinMax = d3.extent(
    Object.values(data)
      .reduce((acc, cur) => ([...acc, ...cur]), [])
      .map((obj) => Object.values(obj))
      .reduce((acc, cur) => ([...acc, ...cur]), [])
  );

  xMinMax[0] = xMinMax[0] > 0 ? 0 : xMinMax[0];
  yMinMax[0] = yMinMax[0] > 0 ? 0 : yMinMax[0];

  return { xMinMax, yMinMax };
};

const getScale = (domain, range) => d3.scaleLinear().domain(domain).range(range);

const addXAxis = (
  svgElem, xScale, { actualWidth, actualHeight, margin } = {}, title
) => {
  svgElem.append('g')
    .classed('x-axis', true)
    .attr('transform', `translate(0, ${actualHeight || 0})`)
    .call(d3.axisBottom(xScale));

  if (title) {
    svgElem.append('text')
      .attr('transform', `translate(${actualWidth / 2}, ${actualHeight + margin.top + 20})`)
      .style('text-anchor', 'middle')
      .text(title);
  }
};

const addYAxis = (
  svgElem, yScale, { actualHeight, margin } = {}, title
) => {
  svgElem.append('g')
    .classed('y-axis', true)
    .call(d3.axisLeft(yScale));

  if (title) {
    svgElem.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (actualHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text(title);
  }
};

const removeXAxis = (svgElem) => {
  svgElem.select('.x-axis').remove();
};

const removeYAxis = (svgElem) => {
  svgElem.select('.y-axis').remove();
};

const initSvgGraph = (svgElem, graphSettings) => {
  if (svgElem) {
    svgElem.selectAll('*').remove();
  }

  const xScale = getScale([0, 1], [0, graphSettings.actualWidth]);
  const yScale = getScale([0, 1], [graphSettings.actualHeight, 0]);

  addXAxis(svgElem, xScale, graphSettings, 'xAxixTitle');
  addYAxis(svgElem, yScale, graphSettings, 'yAxisTitle');

  return { xScale, yScale };
};

const updateScales = (svgElem, data, graphSettings, curScales) => {
  const xDomain = curScales.xScale.domain();
  const yDomain = curScales.yScale.domain();
  const { xMinMax, yMinMax } = getDomains(data);
  const ret = {};

  if (outsideDomain(xDomain, xMinMax[0]) || outsideDomain(xDomain, xMinMax[1])) {
    ret.xScale = getScale(xMinMax, [0, graphSettings.actualWidth]);
    removeXAxis(svgElem);
    addXAxis(svgElem, ret.xScale, graphSettings);
  }

  if (outsideDomain(yDomain, yMinMax[0]) || outsideDomain(yDomain, yMinMax[1])) {
    ret.yScale = getScale(yMinMax, [graphSettings.actualHeight, 0]);
    removeYAxis(svgElem);
    addYAxis(svgElem, ret.yScale, graphSettings);
  }

  return Object.keys(ret).length > 0 ? ret : null;
};

const createPlot = (
  svgContainer, xScale, yScale, data, index = 0, color, dashed = false, background = false
) => {
  const formattedData = Object.keys(data).map((key) => [parseFloat(key), data[key]]);

  return svgContainer
    .append('path')
    // .datum([formattedData[0], formattedData[formattedData.length - 1]])
    .datum(formattedData)
    .attr('d', d3.line().x((d) => xScale(d[0])).y((d) => yScale(d[1])))
    .classed('graph_plot', true)
    .classed(`svg_stroke_scheme_${index}`, true)
    .classed('svg_plot_background', background)
    .classed('svg_plot_reference', dashed); // for dashed lines
};

const updatePlot = (plotElem, xScale, yScale) => plotElem
  .attr('d', d3.line().x((d) => xScale(d[0])).y((d) => yScale(d[1])));

const updateSvgGraph = (svgElem, data, existingSvgLines, graphSettings, { xScale, yScale }) => {
  const newLintPlots = {};

  if (!data || Object.keys(data).length === 0) {
    return newLintPlots;
  }

  Object.keys(data).forEach((alogName, algoIndx) => {
    const dataSets = data[alogName];

    if (!dataSets || dataSets.length === 0) {
      return;
    }

    dataSets.forEach((dataSet, i) => {
      const lineKey = getLineKey(alogName, i);
      if (existingSvgLines[lineKey]) {
        updatePlot(existingSvgLines[lineKey], xScale, yScale);
      } else {
        const newPlot = createPlot(svgElem, xScale, yScale, dataSet, algoIndx);
        newLintPlots[lineKey] = newPlot;
      }
    });
  });

  return newLintPlots;
};

const graphSettings = {
  width: 1400,
  height: 600,
  margin: {
    top: 30,
    right: 60,
    bottom: 80,
    left: 60
  },
  actualWidth: 1400 - 60 - 60,
  actualHeight: 600 - 30 - 80
};

const Graph = (props) => {
  const { data } = props;

  if (!data) {
    return null;
  }
  const svgRef = React.useRef(null);
  const [scales, setScales] = React.useState({});
  const [plottedLines, setPlottedLines] = React.useState([]);

  if (svgRef && svgRef.current && shouldUpdatePlots(plottedLines, data)) {
    const svg = d3.select(svgRef.current);

    const diffScales = updateScales(svg, data, graphSettings, scales);
    const newScales = diffScales ? { ...scales, ...diffScales } : scales;
    setScales({ ...scales, ...diffScales });

    const newLinePlots = updateSvgGraph(svg, data, plottedLines, graphSettings, newScales);
    if (newLinePlots && Object.keys(newLinePlots).length > 0) {
      setPlottedLines({ ...plottedLines, ...newLinePlots });
    }
  }

  React.useEffect(() => {
    if (svgRef && svgRef.current) {
      const svg = d3.select(svgRef.current);
      setScales(initSvgGraph(svg, graphSettings));
    }
  }, []);

  return (
    <svg width={graphSettings.width} height={graphSettings.height}>
      <g ref={svgRef} transform={`translate(${graphSettings.margin.left}, ${graphSettings.margin.top})`} />
    </svg>
  );
};

Graph.propTypes = {
  data: PropTypes.object
};

export default Graph;
