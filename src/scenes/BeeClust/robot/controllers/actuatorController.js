/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
export default function actuatorController(robot, params) {
  return (goal, sensors, actuators, waypoint) => {
    const curGoalArea = sensors.puckGoalAreaSensor;
    const closestPuck = sensors.closestPuckToGrabber;
    const grappedPuck = actuators.grabber.getState();

    if (curGoalArea) {
      if (grappedPuck && curGoalArea === grappedPuck.color) {
        actuators.grabber.deactivate();
      }
    }

    if (!grappedPuck && closestPuck && curGoalArea !== closestPuck.color) {
      actuators.grabber.activate();
    }
  };
}
