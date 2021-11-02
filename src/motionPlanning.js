/* eslint-disable no-unused-vars */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-undef */
/* eslint no-param-reassign: ["error", { "props": false }] */
// eslint-disable-next-line no-unused-vars
import {
  pointOnLineSegmentPerRatio,
  nxtCircIndx,
  minDistanceToLine,
  allPointsAreOnSameSideOfVector,
  pointIsOnRightSideOfVector,
  closestPointInPolygonToPoint,
  distanceBetween2Points,
  distanceBetweenPointAndLine,
  pointIsInsidePolygon,
} from './geometry';

export default function updateWaypoint(robot) {
  // Initialize deadlock detection mechanisms
  const deadLockDetectionDuration = 5;
  let stuckAtTempGoalDuration = 0;

  // Initialize deadlock recovery mechanisms
  let deadLockManeuverInProgress = false;
  let lastDeadlockPosition = null;
  let lastDeadlockAreaRadius = null;
  let lastDeadlockNeighborsCount = null;

  let remainingDeadlockManeuvers = 0;
  const maxConsecutiveDeadlockManeuvers = 6;
  let maneuverDirection = 0;

  const detourPointToOutermostPointRatio = 0.3;
  const detourPointMaxDistance = 6 * robot.radius;

  // DONE
  function findPointInCellClosestToGoal(cell, goal) {
    return closestPointInPolygonToPoint(cell, goal);
  }

  function cellContains(cell, point) {
    return typeof (cell) !== 'undefined' && cell != null
            && pointIsInsidePolygon(point, cell);
  }

  function getFurthestVertexFromLineSeg(cell, linesSegP1, lineSegP2) {
    try {
      let bestVertex = cell[0];
      let maxDist = null;

      cell.forEach((vertex) => {
        const dist = distanceBetweenPointAndLine(
          { x: vertex[0], y: vertex[1] },
          linesSegP1,
          lineSegP2,
        );
        if (maxDist == null || dist > maxDist) {
          bestVertex = vertex;
          maxDist = dist;
        }
      });
      return { x: bestVertex[0], y: bestVertex[1] };
    } catch (error) {
      return robot.position;
    }
  }

  function shouldPerformAnotherManeuver() {
    return remainingDeadlockManeuvers > 0;
  }

  function recoveringFromDeadLock() {
    return deadLockManeuverInProgress || remainingDeadlockManeuvers > 0;
  }

  function getVerteciesOnManeuverDir(cell, linesSegP1, lineSegP2) {
    const vertecies = [];

    cell.forEach((vertex) => {
      const dir = pointIsOnRightSideOfVector(
        vertex[0],
        vertex[1],
        linesSegP1.x,
        linesSegP1.y,
        lineSegP2.x,
        lineSegP2.y,
      );
      if (dir === maneuverDirection) {
        vertecies.push(vertex);
      }
    });
    return vertecies;
  }

  // returns temp goal according to advanced deadlock recovery algorithm
  function setTempGoalAccToAdvancedDeadlockRec(cell) {
    // Get vertices of cell that lie on the current maneuver direction
    const vertecies = getVerteciesOnManeuverDir(cell, robot.position, robot.goal);
    const outermostPoint = getFurthestVertexFromLineSeg(vertecies, robot.position, robot.goal);
    const distanceToOutermostPoint = robot.getDistanceTo(outermostPoint);
    if (distanceToOutermostPoint < detourPointMaxDistance) {
      robot.tempGoal = outermostPoint;
    } else {
      const distWithdefaultRatio = distanceToOutermostPoint * detourPointToOutermostPointRatio;
      const defaultRatioLongerThanMax = distWithdefaultRatio > detourPointMaxDistance;
      const detourRatio = defaultRatioLongerThanMax
        ? detourPointMaxDistance / distanceToOutermostPoint
        : detourPointToOutermostPointRatio;
      robot.tempGoal = pointOnLineSegmentPerRatio(robot.position, outermostPoint, detourRatio);
    }
  }

  function initiateDeadlockManeuver(cell) {
    setTempGoalAccToAdvancedDeadlockRec(cell);
    deadLockManeuverInProgress = true;
  }

  function getNeighborsMeasurementsWithin(point, distance) {
    const closeRobots = [];
    let maxDist = 0;

    robot.neighbors.forEach((r) => {
      const curDist = distanceBetween2Points(r.position, point);
      if (curDist <= distance) {
        closeRobots.push(r);
        maxDist = curDist > maxDist ? curDist : maxDist;
      }
    });

    return { robots: closeRobots, maxDistance: maxDist };
  }

  function neighborsAvoided() {
    const robotsMeasurements = getNeighborsMeasurementsWithin(
      lastDeadlockPosition,
      lastDeadlockAreaRadius,
    );
    const { robots } = robotsMeasurements;
    const robotPositions = robots.map((r) => ({ x: r.position.x, y: r.position.y }));

    if (lastDeadlockNeighborsCount > 1) {
      if (robots.length < 2) {
        // console.log("Successfully Recovered From Deadlock! 1");
        // return Math.random() > 0.3;
      }

      if (allPointsAreOnSameSideOfVector(robotPositions, robot.position, robot.goal)
        && minDistanceToLine(robotPositions, robot.position, robot.goal) > robot.radius * 1.5) {
        // console.log('Successfully Recovered From Deadlock! 2');
        return Math.random() > 0.1;
      }
    }

    return false;
  }

  function deadLockTempGoalStillValid() {
    const tempGoalNotReached = !robot.reachedTempGoal();
    const currentVCellContainsTempGoal = pointIsInsidePolygon(
      robot.tempGoal,
      robot.BVC,
    );
    const maneuverNotSucceededYet = !(deadLockManeuverInProgress && neighborsAvoided());

    return tempGoalNotReached && currentVCellContainsTempGoal && maneuverNotSucceededYet;
  }

  function deadLocked() {
    if (robot.reachedTempGoal() && !robot.reachedGoal()) {
      stuckAtTempGoalDuration += 1;
    } else {
      stuckAtTempGoalDuration = 0;
    }

    return stuckAtTempGoalDuration > deadLockDetectionDuration;
  }

  function getManeuverDirAccToDLRecoveryAlgo(cell) {
    // Add a bit of randomness to the direction of the maneuver
    if (Math.random() > 0.8) return Math.random() > 0.5;

    const furthestPoint = getFurthestVertexFromLineSeg(cell, robot.position, robot.goal);
    const furthestPointDir = pointIsOnRightSideOfVector(furthestPoint.x, furthestPoint.y,
      robot.position.x, robot.position.y,
      robot.goal.x, robot.goal.y);
    return furthestPointDir;
  }

  function startDeadlockRecovery(cell) {
    lastDeadlockPosition = { x: robot.tempGoal.x, y: robot.tempGoal.y };
    lastDeadlockNeighborsCount = getNeighborsMeasurementsWithin(
      robot.tempGoal,
      robot.radius * 5,
    ).robots.length;
    remainingDeadlockManeuvers = lastDeadlockNeighborsCount === 1
      ? maxConsecutiveDeadlockManeuvers / 2 : maxConsecutiveDeadlockManeuvers;
    maneuverDirection = getManeuverDirAccToDLRecoveryAlgo(cell);
    initiateDeadlockManeuver(cell);
  }

  function deadLockExpected(tempGoal) {
    const neighborGoaldistanceThreshold = robot.radius * 3;
    const neighborNeighbordistanceThreshold = robot.radius * 4;

    const neighborsMeasurements = getNeighborsMeasurementsWithin(
      tempGoal,
      neighborGoaldistanceThreshold,
    );
    const robotsCloseToTempGoal = neighborsMeasurements.robots;
    const { maxDistance } = neighborsMeasurements;

    // TODO: Handle case for 1 robot in the way on the edge of environment leading to Deadlock,
    // currently it will be ignored
    if (robotsCloseToTempGoal.length < 2) {
      return false;
    }

    for (let neighborIndx = 0; neighborIndx < robotsCloseToTempGoal.length; neighborIndx += 1) {
      const r = robotsCloseToTempGoal[neighborIndx];
      const nextIndx = nxtCircIndx(neighborIndx, robotsCloseToTempGoal.length);
      const rNext = robotsCloseToTempGoal[nextIndx];

      const distToNextNeighbor = distanceBetween2Points(r.position, rNext.position);
      if (distToNextNeighbor < neighborNeighbordistanceThreshold) {
        const condPointsOnSameSide = allPointsAreOnSameSideOfVector(
          [robot.goal, robot.tempGoal],
          r.position,
          rNext.position,
        );

        if (!condPointsOnSameSide) {
          lastDeadlockAreaRadius = maxDistance;
          // console.log("Deadlock Expected With: " + robotsCloseToTempGoal.length +
          //   " Robots, with max Distance: " + maxDistance);
          return true;
        }
      }
    }
    return false;
  }

  function setLocalGoalByDeadlockRecovery(cell) {
    // tests whether local goal should be set according to deadlock recovery policies
    // if so => sets local goal accordingly and returns true, else returns false

    // If currently recovering from deadlock
    if (recoveringFromDeadLock()) {
      // if current maneuver's tempGoal is still valid (the current tempGoal has not been reached)
      // => do not change it, return true
      if (deadLockTempGoalStillValid(cell)) {
        return robot.tempGoal;
      }
      // if not, then current maneuver's tempGoal has been reached => end current maneuver
      remainingDeadlockManeuvers -= 1;
      deadLockManeuverInProgress = false;

      // if another maneuver is needed => initiate it, localGoal is set there so return true
      if (shouldPerformAnotherManeuver()) {
        initiateDeadlockManeuver(cell);
        return robot.tempGoal;
      }
      remainingDeadlockManeuvers = 0;
    } else if (deadLocked() || deadLockExpected(robot.tempGoal)) {
      // if not recovering from deadlock, test wether currently deadlocked

      // if deadlocked => start deadlock recovery, localGoal is set there so return true
      startDeadlockRecovery(cell);
      return robot.tempGoal;
    }

    // If all condition fails => localGoal should not be set according to deadlock recovery policies
    return null;
  }

  return (cell) => {
    // If cell is undefined (shouldn't happen in collision-free configurations)
    // => set localgoal = goal
    if (cell == null || cell.length < 2) {
      return robot.goal;
    }

    // If the goal is within the Buffered Voronoi cell => set localgoal = goal
    if (cellContains(cell, robot.goal)) {
      return robot.goal;
    }

    // If deadlocked or deadlock is expected or currently recovering from deadlock
    // set local goal according to deadlock recovery policies
    // TODO: fix, seLocationGoalByDeadlockRecovery() should not set tempGoal but return it
    if (setLocalGoalByDeadlockRecovery(cell) != null) {
      return robot.tempGoal;
    }

    // Default behavior: set local goal as the point in cell that is closest to the goal
    return findPointInCellClosestToGoal(cell, robot.goal);
  };
}
