/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
export default function actuatorController(robot, params) {
  return (sensors, actuators, goal, waypoint) => {
    const curGoalArea = sensors.puckGoalAreaSensor;
    const closestPuck = sensors.closestPuckToGrabber;
    const grabbedPuck = actuators.grabber.getState();

    if (curGoalArea) {
      if (grabbedPuck && curGoalArea === grabbedPuck.color) {
        actuators.grabber.deactivate();
      }
    }

    if (!grabbedPuck && closestPuck && curGoalArea !== closestPuck.color) {
      actuators.grabber.activate();
    }
  };
}
