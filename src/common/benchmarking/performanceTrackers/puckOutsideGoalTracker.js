import Tracker from './tracker';

class PucksOutsideGoalTracker extends Tracker {
  constructor() {
    super(
      'pucksOutsideGoal',
      'Number of Pucks Outside Goal Area',
      'average',
      'average',
      { xTitle: 'Time (ms)', yTitle: 'Pucks' }
    );

    this.getValue = (scene) => {
      // Calculate the number of pucks outside of their goal area
      const pucksOutsideGoalCount = scene.pucks
        .map((p) => p.reachedGoal())
        .reduce((acc, cur) => acc + (cur ? 0 : 1), 0);
      return pucksOutsideGoalCount;
    };
  }
}

export default new PucksOutsideGoalTracker();
