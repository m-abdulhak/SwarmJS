import {
  angleBetweenThreePointsDeg,
  closestPointInLineToPoint,
  closestPointInLineSegToPoint,
  distanceBetween2Points,
  translatePointInDirection,
  shiftPointOfLineSegInDirOfPerpendicularBisector,
  pointIsInsidePolygon
} from '../../utils/geometry';

export default function updateGoal(robot) {
  const { radius, envWidth, envHeight } = robot;
  let lastPosition;
  let durationAtCurPosition = 0;
  let stuck = false;
  let avoidingStuckDuration = 0;
  let curGoalTimeSteps = 0;

  const MIN_STUCK_MANEUVER_DURATION = 30;
  const SAME_POSITION_DISTANCE_THRESHOLD = radius / 50;
  const STUCK_DURATION_THRESHOLD = 30;

  const ANGLE_OPTIMAL_THRESHOLD = 15;
  const ANGLE_ACCEPTABLE_THRESHOLD = 75;

  const MIN_GOAL_TIME_STEPS = 100;

  function getRandPoint() {
    return {
      x: (Math.random() * 0.8 + 0.1) * envWidth,
      y: (Math.random() * 0.8 + 0.1) * envHeight
    };
  }

  function getGoalFromClosestPointToEnvBounds(closestPoint) {
    const len = robot.getDistanceTo(closestPoint);

    const translationVec = {
      x: ((closestPoint.x - robot.sense('position').x) * radius) / (len * 10),
      y: ((closestPoint.y - robot.sense('position').y) * radius) / (len * 10)
    };

    let midPoint = translatePointInDirection(
      robot.sense('position').x,
      robot.sense('position').y,
      translationVec.x,
      translationVec.y
    );

    // midPoint = robot.sense('position');

    const delta = radius * 2;
    let newGoal = midPoint;

    newGoal = shiftPointOfLineSegInDirOfPerpendicularBisector(
      midPoint.x,
      midPoint.y,
      robot.sense('position').x,
      robot.sense('position').y,
      closestPoint.x,
      closestPoint.y,
      delta
    );

    if (!robot.pointIsReachableInEnvBounds(newGoal)) {
      translationVec.x *= -1;
      translationVec.y *= -1;

      midPoint = translatePointInDirection(
        robot.sense('position').x,
        robot.sense('position').y,
        translationVec.x,
        translationVec.y
      );

      newGoal = midPoint;

      newGoal = shiftPointOfLineSegInDirOfPerpendicularBisector(
        midPoint.x,
        midPoint.y,
        robot.sense('position').x,
        robot.sense('position').y,
        closestPoint.x,
        closestPoint.y,
        delta
      );
      curGoalTimeSteps = MIN_GOAL_TIME_STEPS;
    } else {
      curGoalTimeSteps = MIN_GOAL_TIME_STEPS;
    }

    return newGoal;
  }

  function getGoalFromEnvOrbit() {
    const envBounds = robot.sense('envBounds');

    const pointsCount = envBounds.length;
    const envRectSides = [];

    for (let index = 0; index < envBounds.length; index += 1) {
      const nextIndx = (index + 1) % pointsCount;
      envRectSides.push([envBounds[index], envBounds[nextIndx]]);
    }

    const allSides = [...envRectSides];

    robot.scene.staticObjects
      .filter((obj) => !obj.def.skipOrbit)
      .map((ob) => ob.sides)
      .forEach((sides) => allSides.push(...sides));

    const closestPointsToSides = allSides.map(
      (side) => closestPointInLineSegToPoint(
        robot.sense('position').x,
        robot.sense('position').y,
        side[0].x,
        side[0].y,
        side[1].x,
        side[1].y
      )
    );

    let closestPoint = closestPointsToSides.reduce((acc, cur) => {
      const condNotReached = robot.getDistanceTo(cur) > 50 || true;
      // const condNotReached = !robot.reached(cur);
      const condFirstCorner = acc == null;
      const condClosestThanAcc = condFirstCorner
      || robot.getDistanceTo(cur) < robot.getDistanceTo(acc);
      if (condNotReached && (condFirstCorner || condClosestThanAcc)) {
        return cur;
      }
      return acc;
    }, null);

    for (let index = 0; index < closestPointsToSides.length; index += 1) {
      const p = closestPointsToSides[index];
      if (robot.getDistanceTo(p) < 5) {
        closestPoint = closestPointsToSides[(index + 1) % (closestPointsToSides.length)];
      }
    }

    const newGoal = robot.algorithmOptions.environmentOrbit
      ? getGoalFromClosestPointToEnvBounds(closestPoint)
      : getRandPoint();

    return newGoal;
  }

  function getGoalFromStuckManeuver() {
    const envOrbitGoal = getGoalFromEnvOrbit();
    const vecToEnvOrbitGoal = {
      x: envOrbitGoal.x - robot.sense('position').x,
      y: envOrbitGoal.y - robot.sense('position').y
    };
    const rotatedEnvOribtGoal = {
      x: -1 * vecToEnvOrbitGoal.y,
      y: vecToEnvOrbitGoal.x
    };
    const newGoal = {
      x: robot.sense('position').x + rotatedEnvOribtGoal.x,
      y: robot.sense('position').y + rotatedEnvOribtGoal.y
    };
    return newGoal;
  }

  function getNormalizedAngleToPuck(robotPosition, puck) {
    const angle = angleBetweenThreePointsDeg(robotPosition, puck.position, puck.goal);
    const normalizedAngle = Math.abs(angle - 180);
    return normalizedAngle;
  }

  function getGoalFromPuck(puck) {
    const normalizedAngle = getNormalizedAngleToPuck(robot.sense('position'), puck);

    if (normalizedAngle < ANGLE_OPTIMAL_THRESHOLD) {
      return puck.position;
    }

    const closestPointInLine = closestPointInLineToPoint(
      robot.sense('position').x,
      robot.sense('position').y,
      puck.position.x,
      puck.position.y,
      puck.goal.x,
      puck.goal.y
    );

    if (normalizedAngle < ANGLE_ACCEPTABLE_THRESHOLD) {
      return closestPointInLine;
    }

    return getGoalFromEnvOrbit();
  }

  function selectBestNearbyPuck() {
    const angleRatings = [];
    const distanceRatings = [];

    robot.sense('nearbyPucks')
      .filter((p) => {
        if (!p.reachedGoal()) {
          const g = getGoalFromPuck(p);

          // Only Test this condition if enabled by robot algorithm options
          const condInRobotVorCell = robot.algorithmOptions.limitPuckSelectionToBVC
            ? pointIsInsidePolygon(p.position, robot.sense('BVC'))
            : true;

          const normalizedAngle = getNormalizedAngleToPuck(robot.sense('position'), p);
          const puckAngleAcceptable = normalizedAngle <= ANGLE_ACCEPTABLE_THRESHOLD;

          const condReachableInEnv = robot.pointIsReachableInEnvBounds(g);
          // TODO: disable after global planning was implemented
          const condReachableOutOfStaticObs = true; // robot.pointIsReachableOutsideStaticObs(g);
          return condInRobotVorCell
            && puckAngleAcceptable
            && condReachableInEnv
            && condReachableOutOfStaticObs;
        }
        return false;
      })
      .forEach((p) => {
        angleRatings.push(
          [p, angleBetweenThreePointsDeg(robot.sense('position'), p.position, p.goal)]
        );
        distanceRatings.push([p, robot.getDistanceTo(p.position)]);
      });

    angleRatings.sort((a, b) => b[1] - a[1]);
    distanceRatings.sort((a, b) => a[1] - b[1]);

    const angleRatsExist = angleRatings.length > 0;
    const distRatsExist = distanceRatings.length > 0;

    let bestPuck = null;

    if (angleRatsExist) {
      [[bestPuck]] = angleRatings;
    } else if (distRatsExist && Math.random() < 0.3) {
      [[bestPuck]] = distanceRatings;
    }
    robot.setBestPuck(bestPuck);

    return bestPuck;
  }

  return () => {
    // If robot was stuck and is still recovering, do not change robot goal
    if (stuck && avoidingStuckDuration <= MIN_STUCK_MANEUVER_DURATION) {
      avoidingStuckDuration += 1;
      return robot.goal;
    }
    // Else, consider maneuver over, reset counters
    stuck = false;
    avoidingStuckDuration = 0;

    // Calc distance to last recorded position
    const distToLastPos = lastPosition
      ? distanceBetween2Points(robot.sense('position'), lastPosition)
      : null;

    // If robot is close enough to be considered at same position
    if (distToLastPos != null && distToLastPos <= SAME_POSITION_DISTANCE_THRESHOLD) {
      // Do not change recorded position, increment stuck timer by 1
      durationAtCurPosition += 1;
    }

    // If stuck timer, reaches threshold to be considered stuck
    if (durationAtCurPosition >= STUCK_DURATION_THRESHOLD) {
      // Reset stuck timer, set state to stuck, start stuck maneuver timer and start maneuver
      durationAtCurPosition = 0;
      stuck = true;
      avoidingStuckDuration = 0;
      return getGoalFromStuckManeuver();
    }

    // Update last position and continue normal operations
    lastPosition = { ...robot.sense('position') };

    let { bestPuck } = robot;
    if (curGoalTimeSteps < MIN_GOAL_TIME_STEPS && !robot.reachedGoal()) {
      curGoalTimeSteps += 1;
    } else {
      bestPuck = selectBestNearbyPuck();
      if (bestPuck !== null) {
        curGoalTimeSteps = 0;
      }
    }

    if (bestPuck === null) {
      return getGoalFromEnvOrbit();
    }
    return getGoalFromPuck(bestPuck);
  };
}
