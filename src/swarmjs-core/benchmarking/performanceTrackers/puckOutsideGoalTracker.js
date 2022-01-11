import Tracker from './tracker';

class PucksOutsideGoalTracker extends Tracker {
  constructor() {
    super(
      'pucksOutsidGoal',
      'Number of Pucks Outside Goal Area',
      'average',
      'average',
      { xTitle: 'Time (ms)', yTitle: 'Pucks' }
    );

    this.getValue = (scene) => scene.pucksOutsideGoalCount;
  }
}

export default new PucksOutsideGoalTracker();
