import { initSvgGraph, shouldUpdatePlots, updateScales, updateSvgGraph } from './graphRenderingUtils';

export default class GraphRenderer {
  constructor(svg, graphSettings) {
    this.scales = initSvgGraph(svg, graphSettings);
    this.graphSettings = graphSettings;
    this.plottedLines = {};
  }

  updateGraph(svg, data, aggData) {
    if (!shouldUpdatePlots(this.plottedLines, data, aggData)) {
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
