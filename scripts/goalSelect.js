/* eslint-disable prefer-destructuring */
/* eslint-disable no-undef */
/* eslint no-param-reassign: ["error", { "props": false }] */
// eslint-disable-next-line no-unused-vars
function updateGoal(robot) {
  function getRandGoal() {
    const d = robot.radius;

    const envRect = [
      { x: d, y: d },
      { x: robot.scene.width - d, y: d },
      { x: robot.scene.width - d, y: robot.scene.height - d },
      { x: d, y: robot.scene.height - d },
    ];

    const envRectSides = [
      [envRect[0], envRect[1]],
      [envRect[1], envRect[2]],
      [envRect[2], envRect[3]],
      [envRect[3], envRect[0]],
    ];

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

    // const midPoint = midPointOfLineSeg(
    //   closestPoint.x,
    //   closestPoint.y,
    //   robot.position.x,
    //   robot.position.y,
    // );

    const len = robot.getDistanceTo(closestPoint);

    const translationVec = {
      x: ((closestPoint.x - robot.position.x) * robot.radius * 2) / (len * 20),
      y: ((closestPoint.y - robot.position.y) * robot.radius * 2) / (len * 20),
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

    // if (robot.getDistanceTo(closestPoint) < robot.radius * 500) {
    newGoal = shiftPointOfLineSegInDirOfPerpendicularBisector(
      midPoint.x,
      midPoint.y,
      robot.position.x,
      robot.position.y,
      closestPoint.x,
      closestPoint.y,
      delta,
    );
    // }

    if (!robot.pointIsReachable(newGoal)) {
      newGoalX = (Math.random() * 0.8 + 0.1) * robot.scene.width;
      newGoalY = (Math.random() * 0.8 + 0.1) * robot.scene.height;
      newGoal = { x: newGoalX, y: newGoalY };
    }

    robot.lastRandGoal = newGoal;
    return robot.lastRandGoal;
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
    if (robot.puckSelectedTimeSteps < robot.minPuckSelectedTimeSteps) {
      robot.puckSelectedTimeSteps += 1;
      return robot.bestPuck;
    }

    const angleRatings = [];
    const distanceRatings = [];
    const puckGoalDistRatings = [];

    robot.nearbyPucks
      .filter((p) => !p.reachedGoal()
                     && !p.isBlocked()
                     && robot.pointIsReachable(getGoalFromPuck(p)))
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
    robot.puckSelectedTimeSteps = 0;
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
