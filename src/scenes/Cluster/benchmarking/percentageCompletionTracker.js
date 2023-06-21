import Tracker from '@common/benchmarking/performanceTrackers/tracker';

// CAN'T GET jsgraphs to work!
//import jsgraphs from 'js-graph-algorithms';

class PercentageCompletionTracker extends Tracker {
  constructor() {
    super(
      'PercentageCompletion',
      'Percentage Completion',
      'average',
      'average',
      { xTitle: 'Time (ms)', yTitle: 'PC' }
    );

    this.getValue = (scene) => {

      return 42;
      /*
      const puckDistanceThreshold = 5 * scene.pucks[0].radius;

      let n = scene.pucks.length;

      // Construct the graph of pucks with edges connecting those pucks which
      // lie within 'puckDistanceThreshold' of each other.
      let graph = new jsgraphs.Graph(n);
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          let dx = scene.pucks[i].position.x - scene.pucks[j].position.x;
          let dy = scene.pucks[i].position.y - scene.pucks[j].position.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < puckDistanceThreshold) {
            graph.addEdge(i, j);
          }
        }
      }

      let cc = new jsgraphs.ConnectedComponents(graph);
      let nComponents = cc.componentCount();

      // Figure out how many nodes belong to each component.  First create
      // an array with a count of zero for each component.
      let counts = []
      for (let i = 0; i < nComponents; i++) {
        counts.push(0);
      }

      // Now go through all nodes and increment the corresponding entry
      // in counts.
      for (let v = 0; v < n; ++v) {
        counts[cc.componentId(v)]++;
      }

      // Finally, get the largest count.
      let largestCount = 0;
      for (let i = 0; i < nComponents; i++) {
        if (counts[i] > largestCount) {
          largestCount = counts[i];
        }
      }

      //return [nComponents, largestCount];

      return (100 * largestCount) / n;
      */
    };
  }
}

export default PercentageCompletionTracker;
