import Tracker from './tracker';

class MinRobotRobotDistanceTracker extends Tracker {
  constructor() {
    super(
      'minRobotRobotDistance',
      'Minimum Robot-Robot Distance',
      'min',
      'min',
      { xTitle: 'Time (ms)', yTitle: 'Distance (cm)' }
    );

    this.getValue = (scene) => {
      let minDist = null;

      scene.robots.forEach((r, i) => {
        const distMeasurements = r
          .getNeighborRobotsDistanceMeasurements(scene.robots.slice(i + 1), 0);

        if (minDist == null || distMeasurements.minDistance < minDist) {
          minDist = distMeasurements.minDistance;
        }
      });

      return minDist;
    };
  }
}

export default new MinRobotRobotDistanceTracker();
