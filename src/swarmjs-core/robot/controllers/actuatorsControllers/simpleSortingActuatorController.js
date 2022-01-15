/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
export default function simpleSortingActuatorController(robot, params) {
  return (sensors, actuators) => {
    const curGoalArea = sensors.puckGoalAreaSensor;
    const closestPuck = sensors.closestPuckToGrapper;
    const grappedPuck = actuators.grapper.getState();

    if (curGoalArea) {
      if (grappedPuck && curGoalArea === grappedPuck.color) {
        actuators.grapper.deactivate();
      }
    }

    if (!grappedPuck && closestPuck && curGoalArea !== closestPuck.color) {
      actuators.grapper.activate();
    }
  };
}
