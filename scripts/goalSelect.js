/* eslint-disable no-unused-vars */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-undef */
/* eslint no-param-reassign: ["error", { "props": false }] */
// eslint-disable-next-line no-unused-vars
function updateGoal(robot) {
  function getRandPoint() {
    return {
      x: (Math.random() * 0.8 + 0.1) * robot.scene.width,
      y: (Math.random() * 0.8 + 0.1) * robot.scene.height,
    };
  }

  function getGoalFromClosestPointToEnvBounds(closestPoint) {
    const len = robot.getDistanceTo(closestPoint);

    const translationVec = {
      x: ((closestPoint.x - robot.position.x) * robot.radius) / (len * 10),
      y: ((closestPoint.y - robot.position.y) * robot.radius) / (len * 10),
    };

    // eslint-disable-next-line prefer-const
    let midPoint = translatePointInDirection(
      robot.position.x,
      robot.position.y,
      translationVec.x,
      translationVec.y,
    );

    // midPoint = robot.position;

    const delta = robot.radius * 2;
    let newGoal = midPoint;

    newGoal = shiftPointOfLineSegInDirOfPerpendicularBisector(
      midPoint.x,
      midPoint.y,
      robot.position.x,
      robot.position.y,
      closestPoint.x,
      closestPoint.y,
      delta,
    );

    if (!robot.pointIsReachableInEnvBounds(newGoal)) {
      translationVec.x *= -1;
      translationVec.y *= -1;

      // eslint-disable-next-line prefer-const
      midPoint = translatePointInDirection(
        robot.position.x,
        robot.position.y,
        translationVec.x,
        translationVec.y,
      );

      newGoal = midPoint;

      newGoal = shiftPointOfLineSegInDirOfPerpendicularBisector(
        midPoint.x,
        midPoint.y,
        robot.position.x,
        robot.position.y,
        closestPoint.x,
        closestPoint.y,
        delta,
      );
      // robot.curGoalTimeSteps = 0;
      robot.curGoalTimeSteps = robot.minCurGoalTimeSteps;
    } else {
      robot.curGoalTimeSteps = robot.minCurGoalTimeSteps;
    }

    return newGoal;
  }

  function getRandGoal() {
    if (robot.curGoalTimeSteps < robot.minCurGoalTimeSteps && !robot.reachedGoal()) {
      robot.curGoalTimeSteps += 1;
      return robot.goal;
    }

    const environmentBounds = robot.scene.environmentBounds.map(
      (point) => ({ x: point[0], y: point[1] }),
    );

    const pointsCount = environmentBounds.length;
    const envRectSides = [];

    for (let index = 0; index < environmentBounds.length; index += 1) {
      const nextIndx = (index + 1) % pointsCount;
      envRectSides.push([environmentBounds[index], environmentBounds[nextIndx]]);
    }

    const closestPointsToSides = envRectSides.map(
      (side) => closestPointInLineSegToPoint(
        robot.position.x,
        robot.position.y,
        side[0].x,
        side[0].y,
        side[1].x,
        side[1].y,
      ),
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

    const newGoal = getGoalFromClosestPointToEnvBounds(closestPoint);

    return newGoal;
  }

  function getGoalFromPuck(puck) {
    const angle = angleBetweenThreePointsDeg(robot.position, puck.position, puck.goal);
    const normalizedAngle = Math.abs(angle - 180);

    if (normalizedAngle < 15) {
      return puck.position;
    }

    const closestPointInLine = closestPointInLineToPoint(
      robot.position.x,
      robot.position.y,
      puck.position.x,
      puck.position.y,
      puck.goal.x,
      puck.goal.y,
    );

    if (normalizedAngle < 75) {
      return closestPointInLine;
    }

    // if (angle < 25) {
    return getRandGoal(robot);
    // }
  }

  function selectBestNearbyPuck() {
    if (robot.curGoalTimeSteps < robot.minCurGoalTimeSteps && !robot.reachedGoal()) {
      robot.curGoalTimeSteps += 1;
      return robot.bestPuck;
    }

    const angleRatings = [];
    const distanceRatings = [];
    const puckGoalDistRatings = [];

    robot.nearbyPucks
      .filter((p) => {
        if (!p.reachedGoal() && !p.isBlocked()) {
          const g = getGoalFromPuck(p);
          return robot.pointIsReachableInEnvBounds(g) && robot.pointIsReachableOutsideStaticObs(g);
        }
        return false;
      })
      .forEach((p) => {
        angleRatings.push([p, angleBetweenThreePointsDeg(robot.position, p.position, p.goal)]);
        distanceRatings.push([p, robot.getDistanceTo(p.position)]);
        puckGoalDistRatings.push([p, p.getDistanceTo(p.goal)]);
      });

    angleRatings.sort((a, b) => b[1] - a[1]);
    distanceRatings.sort((a, b) => 1[1] - b[1]);
    puckGoalDistRatings.sort((a, b) => b[1] - a[1]);

    const angleRatsExist = angleRatings.length > 0;
    const distRatsExist = distanceRatings.length > 0;
    const puckGoalRatsExist = puckGoalDistRatings.length > 0;

    let bestPuck = null;

    if (distRatsExist && distanceRatings[0][1] < robot.radius * 3) {
      bestPuck = distanceRatings[0][0];
    // } else if (puckGoalRatsExist && distanceRatings[0][1] > distanceRatings[0].radius * 100) {
    //   bestPuck = puckGoalDistRatings[0][0];
    } else if (angleRatsExist && Math.random() < 0.3) {
      bestPuck = angleRatings[0][0];
    } else if (distRatsExist && Math.random() < 0.5) {
      bestPuck = distanceRatings[0][0];
    } else if (puckGoalRatsExist) {
      bestPuck = puckGoalDistRatings[0][0];
    }

    robot.bestPuck = bestPuck;
    if (bestPuck !== null) {
      robot.curGoalTimeSteps = 0;
    }
    return bestPuck;
  }

  return () => {
    const bestPuck = selectBestNearbyPuck();
    if (bestPuck === null) {
      robot.goal = getRandGoal();
    } else {
      robot.goal = getGoalFromPuck(bestPuck);
    }
  };
}
