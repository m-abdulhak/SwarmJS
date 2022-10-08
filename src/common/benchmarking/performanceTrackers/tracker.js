/* eslint-disable class-methods-use-this */

// This is an awkward place to put the graph dimensions and margins,
// but since they are used in scaling the plots, I put them here for now.
const defaultGraphSettings = {
  width: 1400,
  height: 600,
  margin: {
    top: 30,
    right: 60,
    bottom: 80,
    left: 60
  },
  actualWidth: 1400 - 60 - 60,
  actualHeight: 600 - 30 - 80,
  xTitle: 'Time (ms)',
  yTitle: ''
};

const defaultReducers = {
  first: (values) => values[0],
  last: (values) => values[values.length - 1],
  average: (values) => values.reduce((acc, val) => acc + val, 0) / values.length,
  min: (values) => Math.min(...values),
  max: (values) => Math.max(...values),
  sum: (values) => values.reduce((acc, val) => acc + val, 0)
};

const defaultAggregators = {
  min: defaultReducers.min,
  max: defaultReducers.max,
  average: defaultReducers.average
};

export default class Tracker {
  constructor(name, title = name, reducer = 'average', aggregator = 'average', graphSettings = {}) {
    // unique name for the tracker, will be used as a key to access tracker data when benchmarking
    this.name = name;

    // Used as the title of the graph
    this.title = title;

    // How to reduce values measured within a single time instance to a single value:
    // 'first', 'last', 'average', 'min', 'max', ...
    this.reduce = defaultReducers[reducer];

    // How to aggregate values corresponding to the same time instance across multiple runs,
    // Used to generate a 'highlight' plot to show the trend across multiple runs:
    // 'min', 'max', 'average', ...
    this.aggregate = defaultAggregators[aggregator];
    this.aggregationType = aggregator;

    // Graph settings such as margins, width, height, xTitle, yTitle
    this.graphSettings = {
      ...defaultGraphSettings,
      ...graphSettings
    };
  }

  // eslint-disable-next-line no-unused-vars
  getValue(scene) {
    throw new Error('Not implemented');
  }
}
