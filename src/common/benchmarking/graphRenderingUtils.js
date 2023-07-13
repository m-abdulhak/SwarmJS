import * as d3 from 'd3';

const getLineKey = (algoName, index) => `${algoName}-${index}`;

const outsideDomain = (domain, value) => value < domain[0] || value > domain[1];

const getDataSetsCount = (data) => Object.values(data)
  .reduce((count, dataSets) => count + dataSets.length, 0);

const getDomains = (data) => {
  if (!data || !Object.values(data)?.[0]?.[0] || !Object.keys(Object.values(data)[0][0])) {
    return { xMinMax: [0, 1], yMinMax: [0, 1] };
  }
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

const addXAxis = (svgElem, xScale, { actualWidth, actualHeight, margin, xTitle } = {}) => {
  svgElem.append('g')
    .classed('x-axis', true)
    .attr('transform', `translate(0, ${actualHeight || 0})`)
    .call(d3.axisBottom(xScale));

  if (xTitle) {
    svgElem.append('text')
      .attr('transform', `translate(${actualWidth / 2}, ${actualHeight + margin.top + 20})`)
      .style('text-anchor', 'middle')
      .text(xTitle);
  }
};

const addYAxis = (svgElem, yScale, { actualHeight, margin, yTitle } = {}) => {
  svgElem.append('g')
    .classed('y-axis', true)
    .call(d3.axisLeft(yScale));

  if (yTitle) {
    svgElem.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (actualHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text(yTitle);
  }
};

const removeXAxis = (svgElem) => {
  svgElem.select('.x-axis').remove();
};

const removeYAxis = (svgElem) => {
  svgElem.select('.y-axis').remove();
};

const createPlot = (
  svgContainer,
  xScale,
  yScale,
  data,
  index = 0,
  background = false,
  dashed = false
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

const updatePlot = (plotElem, xScale, yScale, newData = null) => {
  if (newData) {
    const formattedData = Object.keys(newData).map((key) => [parseFloat(key), newData[key]]);
    plotElem.datum(formattedData);
  }

  plotElem.attr('d', d3.line().x((d) => xScale(d[0])).y((d) => yScale(d[1])));
};

export const updateScales = (svgElem, data, graphSettings, curScales) => {
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

export const countValidDataSets = (data, aggData) => {
  if (!data || !aggData) {
    return 0;
  }
  const dataSetsCount = getDataSetsCount(data);
  const aggDataSetsCount = Object.values(aggData)
    .filter((obj) => Object.values(obj).length > 0).length;
  return dataSetsCount + aggDataSetsCount;
};

export const initSvgGraph = (svgElem, graphSettings) => {
  if (svgElem) {
    svgElem.selectAll('*').remove();
  }

  const xScale = getScale([0, 1], [0, graphSettings.actualWidth]);
  const yScale = getScale([0, 1], [graphSettings.actualHeight, 0]);

  addXAxis(svgElem, xScale, graphSettings);
  addYAxis(svgElem, yScale, graphSettings);

  return { xScale, yScale };
};

export const updateSvgGraph = (svgElem, data, aggData, existingSvgLines, { xScale, yScale }) => {
  const newLinePlots = {};

  if (!data || Object.keys(data).length === 0) {
    return newLinePlots;
  }

  Object.keys(data).forEach((algoName, algoIndx) => {
    const dataSets = data[algoName];

    if (!dataSets || dataSets.length === 0) {
      return;
    }

    dataSets.forEach((dataSet, i) => {
      const lineKey = getLineKey(algoName, i);
      if (existingSvgLines[lineKey]) {
        updatePlot(existingSvgLines[lineKey], xScale, yScale);
      } else {
        const newPlot = createPlot(svgElem, xScale, yScale, dataSet, algoIndx, true);
        newLinePlots[lineKey] = newPlot;
      }
    });

    if (aggData[algoName]) {
      const aggDataSet = aggData[algoName];
      const lineKey = getLineKey(algoName, 'agg');
      if (existingSvgLines[lineKey]) {
        updatePlot(existingSvgLines[lineKey], xScale, yScale, aggDataSet);
      } else {
        const newPlot = createPlot(svgElem, xScale, yScale, aggDataSet, algoIndx, false);
        newLinePlots[lineKey] = newPlot;
      }
    }
  });

  return newLinePlots;
};
