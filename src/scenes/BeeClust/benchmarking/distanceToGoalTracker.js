import Tracker from '@common/benchmarking/performanceTrackers/tracker';

const GOAL = { x: 450, y: 100 };

class DistanceToGoalTracker extends Tracker {
  constructor() {
    super(
      'DistanceToGoal',
      'Average Distance to Goal',
      'average',
      'average',
      { xTitle: 'Time (ms)', yTitle: 'Distance (m)' }
    );

    this.getValue = (scene) => {
      let distance = 0;

      scene.robots.forEach((r) => {
        distance += r.getDistanceTo(GOAL);
      });

      return distance / scene.robots.length;
    };
  }
}

export default new DistanceToGoalTracker();
