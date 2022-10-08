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

    this.getValue = (scene) => {
      let dis = 0;

      scene.pucks.forEach((p) => {
        const distToGoal = p.getDistanceTo(p.groupGoal);
        dis += distToGoal > p.goalReachedDist ? (distToGoal - p.goalReachedDist) / 100 : 0;
      });

      return dis;
    };
  }
}

export default new RobotToGoalDistanceTracker();
