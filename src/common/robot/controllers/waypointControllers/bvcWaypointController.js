import {
  pointOnLineSegmentPerRatio,
  nxtCircIndx,
  minDistanceToLine,
  allPointsAreOnSameSideOfVector,
  pointIsOnRightSideOfVector,
  closestPointInPolygonToPoint,
  getDistance,
  distanceBetweenPointAndLine,
  pointIsInsidePolygon
} from '../../../utils/geometry';

// eslint-disable-next-line no-unused-vars
export default function bvcWaypointController(robot, params) {
  // Initialize deadlock detection mechanisms
  const deadLockDetectionDuration = 5;
  let stuckAtWaypointDuration = 0;

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
          lineSegP2
        );
        if (maxDist == null || dist > maxDist) {
          bestVertex = vertex;
          maxDist = dist;
        }
      });
      return { x: bestVertex[0], y: bestVertex[1] };
    } catch (error) {
      return robot.sensors.position;
    }
  }

  function shouldPerformAnotherManeuver() {
    return remainingDeadlockManeuvers > 0;
  }

  function recoveringFromDeadLock() {
    return deadLockManeuverInProgress || remainingDeadlockManeuvers > 0;
  }

  function getVerticesOnManeuverDir(cell, linesSegP1, lineSegP2) {
    const vertices = [];

    cell.forEach((vertex) => {
      const dir = pointIsOnRightSideOfVector(
        vertex[0],
        vertex[1],
        linesSegP1.x,
        linesSegP1.y,
        lineSegP2.x,
        lineSegP2.y
      );
      if (dir === maneuverDirection) {
        vertices.push(vertex);
      }
    });
    return vertices;
  }

  // returns temp goal according to advanced deadlock recovery algorithm
  function setWaypointAccToAdvancedDeadlockRec(cell) {
    // Get vertices of cell that lie on the current maneuver direction
    const vertices = getVerticesOnManeuverDir(cell, robot.sensors.position, robot.goal);
    const outermostPoint = getFurthestVertexFromLineSeg(
      vertices,
      robot.sensors.position,
      robot.goal
    );
    const distanceToOutermostPoint = robot.getDistanceTo(outermostPoint);
    if (distanceToOutermostPoint < detourPointMaxDistance) {
      robot.setWaypoint(outermostPoint);
    } else {
      const distWithdefaultRatio = distanceToOutermostPoint * detourPointToOutermostPointRatio;
      const defaultRatioLongerThanMax = distWithdefaultRatio > detourPointMaxDistance;
      const detourRatio = defaultRatioLongerThanMax
        ? detourPointMaxDistance / distanceToOutermostPoint
        : detourPointToOutermostPointRatio;
      robot.setWaypoint(
        pointOnLineSegmentPerRatio(robot.sensors.position, outermostPoint, detourRatio)
      );
    }
  }

  function initiateDeadlockManeuver(cell) {
    setWaypointAccToAdvancedDeadlockRec(cell);
    deadLockManeuverInProgress = true;
  }

  function getNeighborsMeasurementsWithin(point, distance) {
    const closeRobots = [];
    let maxDist = 0;

    robot.sensors.neighbors.forEach((r) => {
      const curDist = getDistance(r.sensors.position, point);
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
      lastDeadlockAreaRadius
    );
    const { robots } = robotsMeasurements;
    const robotPositions = robots
      .map((r) => ({ x: r.sensors.position.x, y: r.sensors.position.y }));

    if (lastDeadlockNeighborsCount > 1) {
      if (robots.length < 2) {
        // console.log("Successfully Recovered From Deadlock! 1");
        // return Math.random() > 0.3;
      }

      if (allPointsAreOnSameSideOfVector(robotPositions, robot.sensors.position, robot.goal)
        && minDistanceToLine(robotPositions, robot.sensors.position, robot.goal)
            > robot.radius * 1.5) {
        // console.log('Successfully Recovered From Deadlock! 2');
        return Math.random() > 0.1;
      }
    }

    return false;
  }

  function deadLockWaypointStillValid() {
    const waypointNotReached = !robot.sensors.reachedWaypoint;
    const currentVCellContainsWaypoint = pointIsInsidePolygon(
      robot.waypoint,
      robot.sensors.BVC
    );
    const maneuverNotSucceededYet = !(deadLockManeuverInProgress && neighborsAvoided());

    return waypointNotReached && currentVCellContainsWaypoint && maneuverNotSucceededYet;
  }

  function deadLocked() {
    if (robot.sensors.reachedWaypoint && !robot.sensors.reachedGoal) {
      stuckAtWaypointDuration += 1;
    } else {
      stuckAtWaypointDuration = 0;
    }

    return stuckAtWaypointDuration > deadLockDetectionDuration;
  }

  function getManeuverDirAccToDLRecoveryAlgo(cell) {
    // Add a bit of randomness to the direction of the maneuver
    if (Math.random() > 0.8) return Math.random() > 0.5;

    const furthestPoint = getFurthestVertexFromLineSeg(cell, robot.sensors.position, robot.goal);
    const furthestPointDir = pointIsOnRightSideOfVector(
      furthestPoint.x,
      furthestPoint.y,
      robot.sensors.position.x,
      robot.sensors.position.y,
      robot.goal.x,
      robot.goal.y
    );
    return furthestPointDir;
  }

  function startDeadlockRecovery(cell) {
    lastDeadlockPosition = { x: robot.waypoint.x, y: robot.waypoint.y };
    lastDeadlockNeighborsCount = getNeighborsMeasurementsWithin(
      robot.waypoint,
      robot.radius * 5
    ).robots.length;
    remainingDeadlockManeuvers = lastDeadlockNeighborsCount === 1
      ? maxConsecutiveDeadlockManeuvers / 2 : maxConsecutiveDeadlockManeuvers;
    maneuverDirection = getManeuverDirAccToDLRecoveryAlgo(cell);
    initiateDeadlockManeuver(cell);
  }

  function deadLockExpected(waypoint) {
    const neighborGoaldistanceThreshold = robot.radius * 3;
    const neighborNeighbordistanceThreshold = robot.radius * 4;

    const neighborsMeasurements = getNeighborsMeasurementsWithin(
      waypoint,
      neighborGoaldistanceThreshold
    );
    const robotsCloseToWaypoint = neighborsMeasurements.robots;
    const { maxDistance } = neighborsMeasurements;

    // TODO: Handle case for 1 robot in the way on the edge of environment leading to Deadlock,
    // currently it will be ignored
    if (robotsCloseToWaypoint.length < 2) {
      return false;
    }

    for (let neighborIndx = 0; neighborIndx < robotsCloseToWaypoint.length; neighborIndx += 1) {
      const r = robotsCloseToWaypoint[neighborIndx];
      const nextIndx = nxtCircIndx(neighborIndx, robotsCloseToWaypoint.length);
      const rNext = robotsCloseToWaypoint[nextIndx];

      const distToNextNeighbor = getDistance(r.sensors.position, rNext.sensors.position);
      if (distToNextNeighbor < neighborNeighbordistanceThreshold) {
        const condPointsOnSameSide = allPointsAreOnSameSideOfVector(
          [robot.goal, robot.waypoint],
          r.sensors.position,
          rNext.sensors.position
        );

        if (!condPointsOnSameSide) {
          lastDeadlockAreaRadius = maxDistance;
          // console.log("Deadlock Expected With: " + robotsCloseToWaypoint.length +
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
      // if current maneuver's waypoint is still valid (the current waypoint has not been reached)
      // => do not change it, return true
      if (deadLockWaypointStillValid(cell)) {
        return robot.waypoint;
      }
      // if not, then current maneuver's waypoint has been reached => end current maneuver
      remainingDeadlockManeuvers -= 1;
      deadLockManeuverInProgress = false;

      // if another maneuver is needed => initiate it, localGoal is set there so return true
      if (shouldPerformAnotherManeuver()) {
        initiateDeadlockManeuver(cell);
        return robot.waypoint;
      }
      remainingDeadlockManeuvers = 0;
    } else if (deadLocked() || deadLockExpected(robot.waypoint)) {
      // if not recovering from deadlock, test wether currently deadlocked

      // if deadlocked => start deadlock recovery, localGoal is set there so return true
      startDeadlockRecovery(cell);
      return robot.waypoint;
    }

    // If all condition fails => localGoal should not be set according to deadlock recovery policies
    return null;
  }

  return (sensors, actuators, goal) => {
    const cell = sensors.BVC;
    // If cell is undefined (shouldn't happen in collision-free configurations)
    // => set localgoal = goal
    if (cell == null || cell.length < 2) {
      return goal;
    }

    // If the goal is within the Buffered Voronoi cell => set localgoal = goal
    if (cellContains(cell, goal)) {
      return goal;
    }

    // If deadlocked or deadlock is expected or currently recovering from deadlock
    // set local goal according to deadlock recovery policies
    // TODO: fix, seLocationGoalByDeadlockRecovery() should not set waypoint but return it
    if (setLocalGoalByDeadlockRecovery(cell) != null) {
      return robot.waypoint;
    }

    // Default behavior: set local goal as the point in cell that is closest to the goal
    return findPointInCellClosestToGoal(cell, goal);
  };
}
