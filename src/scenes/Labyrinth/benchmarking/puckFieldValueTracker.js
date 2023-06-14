import Tracker from '@common/benchmarking/performanceTrackers/tracker';
import { sampleFieldAtPoint } from '@common/utils/canvasUtils';

class PuckFieldValueTracker extends Tracker {
  constructor(ideal_tau) {
    super(
      'PuckFieldValue',
      'Sum of Squared Differences',
      'average',
      'average',
      { xTitle: 'Time (ms)', yTitle: 'SSD' }
    );

    this.getValue = (scene) => {
      let ssd = 0;

      scene.pucks.forEach((p) => {
        let point = {x: Math.round(p.position.x), y: Math.round(p.position.y)};
        const fieldValue = sampleFieldAtPoint(scene.fields.travelTime.src, point)[0] / 255.0;
        ssd += (fieldValue - ideal_tau) ** 2;
      });

      return 100 * ssd / scene.pucks.length;
    };
  }
}

//export default new PuckFieldValueTracker();
export default PuckFieldValueTracker;
