/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
import { normalizeAnglePlusMinusPi, getAngularDifference } from '@common/utils/geometry';

const normalizeAnglePlusMinusPiFunc = normalizeAnglePlusMinusPi;
const getAngularDifferenceFunc = getAngularDifference;

export function init(CONST, VAR, FUNC, robot, params) {
  // PARAMETERS:
  CONST.maxAngularSpeed = 0.01;
  CONST.maxForwardSpeed = 0.1;
  CONST.searchSpinDistMin = 1;
  CONST.searchSpinDistMax = 20;
  CONST.searchStraightDistMin = 10;
  CONST.searchStraightDistMax = 50;
  CONST.minTurnSteps = 4;
  CONST.minCurveIntensity = 51;
  CONST.onCurveThreshold = CONST.minCurveIntensity / 255;
  CONST.angleThreshold = 0.5;
  CONST.angleDiffThreshold = 0.15;
  CONST.pucksAsRobots = false;

  CONST.puckSensorRadius = 4;
  CONST.puckSensorDistance = 20;
  CONST.puckSensorAngularWidth = 2 * Math.atan(CONST.puckSensorRadius / CONST.puckSensorDistance);

  CONST.ROBOT_STATE = {
    SEARCH_SPIN: 'SEARCH_SPIN',
    SEARCH_STRAIGHT: 'SEARCH_STRAIGHT',
    FOLLOW_CURVE: 'FOLLOW_CURVE',
    ABOUT_FACE: 'ABOUT_FACE',
    TURN_TO_STRIKE: 'TURN_TO_STRIKE',
    RECOVERY_TURN: 'RECOVERY_TURN',
    DEBUG_STOP: 'DEBUG_STOP'
  };

  CONST.CHIRALITY_STATE = {
    UNKNOWN: 'UNKNOWN',
    CW: 'CW',
    CCW: 'CCW'
  };

  VAR.state = CONST.ROBOT_STATE.FOLLOW_CURVE;
  VAR.chirality = CONST.CHIRALITY_STATE.UNKNOWN;
  VAR.stepsInState = 0;
  VAR.stepsInChirality = 0;
  VAR.dwellSteps = 0;
  VAR.turnDirection = 1;
  VAR.desiredAngle = 0;
  VAR.relativeGoalAngle = 0;

  // Scale the given value from the scale of src to the scale of dst.
  FUNC.scale = (val, srcMin, srcMax, dstMin, dstMax) => (
    ((val - srcMin) / (srcMax - srcMin)) * (dstMax - dstMin) + dstMin
  );

  FUNC.sign = (x) => {
    if (x > 0) return 1;
    if (x < 0) return -1;
    return 0;
  };

  FUNC.setNewState = (newState) => {
    VAR.state = newState;
    VAR.stepsInState = 0;
    // console.log("STATE: " + state);
  };

  FUNC.updateChirality = (sensors) => {
    const sensedChiralityMarker = (sensors.fields.readings.heatMap.edge)[2] / 255;
    let newChirality = VAR.chirality;
    if (Math.abs(sensedChiralityMarker - 1) < 0.1) {
      newChirality = CONST.CHIRALITY_STATE.CCW;
    } else if (Math.abs(sensedChiralityMarker - 0.498) < 0.1) {
      newChirality = CONST.CHIRALITY_STATE.CW;
    }

    // Did we actually change chirality?
    if (newChirality !== VAR.chirality) {
      VAR.chirality = newChirality;
      VAR.stepsInChirality = 0;
      // console.log("CHIRALITY: " + chirality);
    }
  };

  FUNC.forceToggleChirality = () => {
    // Now allowing this to be called when the chirality is unknown.  We
    // just allow it to stay unknown.
    // assert(chirality != CHIRALITY_STATE.UNKNOWN);

    if (VAR.chirality === CONST.CHIRALITY_STATE.CW) {
      VAR.chirality = CONST.CHIRALITY_STATE.CCW;
    } else if (VAR.chirality === CONST.CHIRALITY_STATE.CCW) {
      VAR.chirality = CONST.CHIRALITY_STATE.CW;
    }

    VAR.stepsInChirality = 0;
  };

  FUNC.pucksInSwath = (sensors, lowAngle, highAngle, SIDE) => {
    let total = 0;
    const nSensorRegions = Object.keys(sensors.circles).length;
    const deltaAngle = (2 * Math.PI) / nSensorRegions;

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < nSensorRegions; ++i) {
      const angle = normalizeAnglePlusMinusPiFunc(i * deltaAngle);
      // console.log("i: " + i + ", pucks: " + sensors.circles[`index${i}`].reading.pucks + ", " +
      //  (angle - 0.5 * puckSensorAngularWidth >= lowAngle && angle + 0.5 * puckSensorAngularWidth <= highAngle));

      if (
        angle - 0.5 * CONST.puckSensorAngularWidth >= lowAngle
        && angle + 0.5 * CONST.puckSensorAngularWidth <= highAngle
      ) {
        total += sensors.circles[`index${i}`].reading.pucks;
        if (SIDE === 'left') {
          sensors.circles[`index${i}`].reading.robots = 100;
        } else if (SIDE === 'right') {
          sensors.circles[`index${i}`].reading.walls = 100;
        }
      }
    }

    return total;
  };
}

/* eslint-disable no-eval */
export function controller(robot, params, onLoop, onInit) {
  // Object that contains constants
  const CONST = {};

  // Object that contains variables
  const VAR = {};

  // Object that contains functions
  const FUNC = {};

  let initFunc = () => {};
  if (onInit) {
    const userDefinedInitFunc = eval(onInit);

    if (userDefinedInitFunc && typeof userDefinedInitFunc === 'function') {
      initFunc = userDefinedInitFunc;
    }
  }

  initFunc(CONST, VAR, FUNC, robot, params);

  Object.freeze(CONST);

  if (onLoop) {
    const func = eval(onLoop);

    if (func && typeof func === 'function') {
      return func;
    }
  }

  return (sensors) => {
    sensors.goalVis = sensors.position;

    const command = { linearVel: 0, angularVel: 0, type: robot.SPEED_TYPES.RELATIVE };

    if (!sensors.fields.readings.heatMap.left
      || !sensors.fields.readings.heatMap.centre
      || !sensors.fields.readings.heatMap.right) {
      return command;
    }

    const l = (sensors.fields.readings.heatMap.left)[0] / 255;
    const c = (sensors.fields.readings.heatMap.centre)[0] / 255;
    const r = (sensors.fields.readings.heatMap.right)[0] / 255;
    // console.log("l, c, r: %g, %g, %g", l, c, r);

    const L = l > CONST.onCurveThreshold;
    const C = c > CONST.onCurveThreshold;
    const R = r > CONST.onCurveThreshold;
    const onCurve = C && (!R || !L);
    const offCurve = !C && !R && !L;

    //
    // Handle state transitions...
    //

    // This is reset whenever a new state is set, which should only be done by
    // calling setNewState.
    VAR.stepsInState += 1;

    // This is reset whenever the chirality changes.
    VAR.stepsInChirality += 1;

    if (VAR.state === CONST.ROBOT_STATE.SEARCH_SPIN) {
      if (onCurve) {
        FUNC.setNewState(CONST.ROBOT_STATE.FOLLOW_CURVE);
      } else if (VAR.stepsInState > VAR.dwellSteps) {
        FUNC.setNewState(CONST.ROBOT_STATE.SEARCH_STRAIGHT);
        VAR.dwellSteps = Math.ceil(
          CONST.searchStraightDistMin + (CONST.searchStraightDistMax - CONST.searchStraightDistMin) * Math.random()
        );
      }
    } else if (VAR.state === CONST.ROBOT_STATE.SEARCH_STRAIGHT) {
      if (onCurve) {
        FUNC.setNewState(CONST.ROBOT_STATE.FOLLOW_CURVE);
      } else if (sensors.polygons.ahead.reading.robots > 0 || VAR.stepsInState > VAR.dwellSteps) {
        FUNC.setNewState(CONST.ROBOT_STATE.SEARCH_SPIN);
        VAR.dwellSteps = Math.ceil(
          CONST.searchSpinDistMin + (CONST.searchSpinDistMax - CONST.searchSpinDistMin) * Math.random()
        );
      }
    } else if (VAR.state === CONST.ROBOT_STATE.FOLLOW_CURVE) {
      FUNC.updateChirality(sensors);

      if (offCurve) {
        FUNC.setNewState(CONST.ROBOT_STATE.SEARCH_SPIN);
        VAR.dwellSteps = Math.ceil(
          CONST.searchSpinDistMin + (CONST.searchSpinDistMax - CONST.searchSpinDistMin) * Math.random()
        );
      } else if (onCurve && sensors.polygons.ahead.reading.robots > 0 && VAR.stepsInChirality > 10) {
        FUNC.forceToggleChirality();
        FUNC.setNewState(CONST.ROBOT_STATE.ABOUT_FACE);
        VAR.turnDirection = 1; // This is arbitrary.  Could be -1.
      } else if (onCurve && VAR.chirality !== CONST.CHIRALITY_STATE.UNKNOWN && VAR.stepsInState > 10) {
        // Fill this with the info from the swath with the most pucks.
        let bestSwath = null;

        // Decode the value in reading.floorCentre.
        const rawValue = (sensors.fields.readings.heatMap.centre)[0];
        VAR.relativeGoalAngle = FUNC.scale(rawValue, CONST.minCurveIntensity, 255, -Math.PI, Math.PI);
        // console.log("raw: " + rawValue + ", scaled: " + VAR.relativeGoalAngle);
        if (VAR.chirality === CONST.CHIRALITY_STATE.CCW) {
          VAR.relativeGoalAngle = normalizeAnglePlusMinusPiFunc(VAR.relativeGoalAngle + Math.PI);
        }

        // For visualization
        const vecLength = 100;
        sensors.goalVis = { x: sensors.position.x + vecLength * Math.cos(sensors.orientation + VAR.relativeGoalAngle),
          y: sensors.position.y + vecLength * Math.sin(sensors.orientation + VAR.relativeGoalAngle) };

        const leftSwath = FUNC.pucksInSwath(sensors, -Math.PI, VAR.relativeGoalAngle - CONST.angleThreshold, 'left');
        const rightSwath = FUNC.pucksInSwath(sensors, VAR.relativeGoalAngle + CONST.angleThreshold, Math.PI, 'right');
        // console.log('leftSwath, rightSwath: ' + leftSwath + ", " + rightSwath);
        if (leftSwath > 0 && leftSwath >= rightSwath) {
          bestSwath = 'left';
          VAR.relativeGoalAngle -= CONST.angleThreshold;
        } else if (rightSwath > 0) {
          bestSwath = 'right';
          VAR.relativeGoalAngle += CONST.angleThreshold;
        }

        if (bestSwath != null) {
          // Prepare to strike!
          FUNC.setNewState(CONST.ROBOT_STATE.TURN_TO_STRIKE);
          if (bestSwath === 'left') {
            VAR.turnDirection = 1;
            VAR.desiredAngle = sensors.orientation + VAR.turnDirection * (VAR.relativeGoalAngle + Math.PI);
          } else {
            VAR.turnDirection = -1;
            VAR.desiredAngle = sensors.orientation + VAR.turnDirection * (Math.PI - VAR.relativeGoalAngle);
          }
        }
      }
    } else if (VAR.state === CONST.ROBOT_STATE.ABOUT_FACE) {
      if (VAR.stepsInState > CONST.minTurnSteps && C) {
        FUNC.setNewState(CONST.ROBOT_STATE.FOLLOW_CURVE);
      } else if (VAR.stepsInState > 100) {
        // We've perhaps been bumped off the curve.  Give up and search.
        FUNC.setNewState(CONST.ROBOT_STATE.SEARCH_SPIN);
        VAR.dwellSteps = Math.ceil(
          CONST.searchSpinDistMin + (CONST.searchSpinDistMax - CONST.searchSpinDistMin) * Math.random()
        );
      }
    } else if (VAR.state === CONST.ROBOT_STATE.TURN_TO_STRIKE) {
      if (getAngularDifferenceFunc(VAR.desiredAngle, sensors.orientation) < CONST.angleDiffThreshold) {
        FUNC.setNewState(CONST.ROBOT_STATE.RECOVERY_TURN);
        if (VAR.turnDirection === 1) {
          VAR.desiredAngle = sensors.orientation - (VAR.relativeGoalAngle + Math.PI);
        } else {
          VAR.desiredAngle = sensors.orientation + (Math.PI - VAR.relativeGoalAngle);
        }

        if (CONST.pucksAsRobots) {
          // This is to test the idea of being unable to sense the difference between
          // pucks and robots.  So whenever we recover from the strike, we set the
          // desired angle as above, but without the addition of pi, leading to this
          // single expression.
          VAR.desiredAngle = sensors.orientation - VAR.relativeGoalAngle;
          FUNC.forceToggleChirality();
        }
        VAR.turnDirection *= -1;
      } else {
      // console.log("diff: " + getAngularDifferenceFunc(VAR.desiredAngle, sensors.orientation));
      }
    } else if (VAR.state === CONST.ROBOT_STATE.RECOVERY_TURN) {
      if (getAngularDifferenceFunc(VAR.desiredAngle, sensors.orientation) < CONST.angleDiffThreshold) {
        FUNC.setNewState(CONST.ROBOT_STATE.FOLLOW_CURVE);
      } else {
      // console.log("diff: " + getAngularDifferenceFunc(VAR.desiredAngle, sensors.orientation));
      }
    }

    //
    // Knowing what VAR.state we are in, act.
    //

    // Forward speed v and angular speed w.  Will get further modified below.
    let v = 0;
    let w = 0;

    if (VAR.state === CONST.ROBOT_STATE.SEARCH_SPIN) {
      v = 0;
      w = 1;
    } else if (VAR.state === CONST.ROBOT_STATE.SEARCH_STRAIGHT) {
      v = 1;
      w = 0;
    } else if (
      VAR.state === CONST.ROBOT_STATE.ABOUT_FACE
      || VAR.state === CONST.ROBOT_STATE.TURN_TO_STRIKE
      || VAR.state === CONST.ROBOT_STATE.RECOVERY_TURN
    ) {
      // We're in one of the TURN VAR.states.
      v = 0;
      w = VAR.turnDirection; // Technically, we could do without VAR.turnDirection
      // and just use w, but I think it adds clarity.
    } else if (VAR.state === CONST.ROBOT_STATE.DEBUG_STOP) {
      v = 0;
      w = 0;
    } else if (VAR.state === CONST.ROBOT_STATE.FOLLOW_CURVE) {
      const arbitraryTurn = -1;
      v = 1;
      if (!L && !R && !C) {
        // We're off track.
        w = 0;
      } else if (!L && !R && C) {
        // On track, go straight.
        w = 0;
      } else if (!L && R && !C) {
        // Track is on the right, go right.
        w = 1;
      } else if (!L && R && C) {
        // Track is on the right, go right.
        w = 1;
      } else if (L && !R && !C) {
        // Track is on the left, go left.
        w = -1;
      } else if (L && !R && C) {
        // Track is on the left, go left.
        w = -1;
      } else if (L && R && !C) {
        // This is weird, go straight.
        w = 0;
      } else if (L && R && C) {
        // We're facing the line perpendicularly.  Choose the arbitrary turn to join it.
        w = arbitraryTurn;
      }
    }

    // console.log("STATE: %s, CHIRALITY: %s: ", VAR.state, VAR.chirality);
    // console.log("angularSpeed: %g", angularSpeed);

    // console.log("x, y: " + sensors.position.x + ", " + sensors.position.y);
    // console.log("theta: " + sensors.orientation);

    command.linearVel = v * CONST.maxForwardSpeed * robot.velocityScale;
    command.angularVel = w * CONST.maxAngularSpeed * robot.velocityScale;

    sensors.state = VAR.state;

    // command.linearVel = 0;
    // command.angularVel = 0;
    return command;
  };
}
