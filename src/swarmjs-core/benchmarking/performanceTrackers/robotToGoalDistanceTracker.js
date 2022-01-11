import Tracker from './tracker';

class RobotToGoalDistanceTracker extends Tracker {
  constructor() {
    super(
      'RobotToGoalDistance',
      'Total Pucks To Goal Distance',
      'average',
      'average',
      { xTitle: 'Time (ms)', yTitle: 'Distance (m)' }
    );

    this.getValue = (scene) => scene.distance;
  }
}

export default new RobotToGoalDistanceTracker();
