import { initSvgGraph, countValidDataSets, updateScales, updateSvgGraph } from './graphRenderingUtils';

export default class GraphRenderer {
  constructor(svg, graphSettings) {
    this.scales = initSvgGraph(svg, graphSettings);
    this.graphSettings = graphSettings;
    this.plottedLines = {};
  }

  updateGraph(svg, data, aggData) {
    const setsCount = countValidDataSets(data, aggData);
    const plottedLinesCount = Object.keys(this.plottedLines).length;

    if (setsCount < plottedLinesCount) {
      Object.values(this.plottedLines).forEach((plot) => plot.remove());
      this.plottedLines = {};
      return;
    }

    if (setsCount === plottedLinesCount) {
      return;
    }

    const diffScales = updateScales(svg, data, this.graphSettings, this.scales);
    this.scales = diffScales ? { ...this.scales, ...diffScales } : this.scales;

    const newLinePlots = updateSvgGraph(svg, data, aggData, this.plottedLines, this.scales);
    if (newLinePlots && Object.keys(newLinePlots).length > 0) {
      this.plottedLines = { ...this.plottedLines, ...newLinePlots };
    }
  }
}
