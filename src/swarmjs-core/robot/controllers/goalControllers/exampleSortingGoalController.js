/* eslint-disable prefer-const */
export default function exampleSortingGoalController(robot, params) {
  const getGoalFromDir = (position, dir, multi) => {
    const vector = { x: dir.x - position.x, y: dir.y - position.y };
    const goal = { x: position.x + vector.x * multi, y: position.y + vector.y * multi };
    return goal;
  };

  let minGoalHoldTime = 100;
  let curGoalHoldTime = 0;
  let goalDistance = 20;

  return (oldGoal, sensors, actuators) => {
    const curGoalArea = sensors.puckGoalAreaSensor;
    const grappedPuck = actuators.grapper.getState();

    if (curGoalArea && grappedPuck && curGoalArea === grappedPuck.color) {
      curGoalHoldTime = 0;
      return getGoalFromDir(
        sensors.position,
        sensors.directions.left,
        goalDistance
      );
    }

    if (oldGoal != null && curGoalHoldTime < minGoalHoldTime) {
      curGoalHoldTime += 1;
      return oldGoal;
    }

    curGoalHoldTime = 0;

    if (
      sensors.walls.includes('forward')
      && sensors.walls.includes('left')
      && sensors.walls.includes('right')
    ) {
      return getGoalFromDir(
        sensors.position,
        sensors.directions.backward,
        goalDistance
      );
    }

    if (sensors.walls.includes('left')) {
      return getGoalFromDir(
        sensors.position,
        sensors.directions.forwardRight,
        goalDistance
      );
    }
    if (sensors.walls.includes('right')) {
      return getGoalFromDir(
        sensors.position,
        sensors.directions.forwardLeft,
        goalDistance
      );
    }

    return getGoalFromDir(
      sensors.position,
      sensors.directions.forward,
      goalDistance
    );
  };
}
