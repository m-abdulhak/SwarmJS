import { normalizeAnglePlusMinusPi, getAngularDifference } from '@common/utils/geometry';

/* eslint-disable no-eval */
export default function controller(robot, params, onLoop) {
  // PARAMETERS:
  const maxAngularSpeed = 0.01;
  const maxForwardSpeed = 0.1;
  const searchSpinDistMin = 1;
  const searchSpinDistMax = 20;
  const searchStraightDistMin = 10;
  const searchStraightDistMax = 50;
  const minTurnSteps = 4;
  const minCurveIntensity = 51;
  const onCurveThreshold = minCurveIntensity / 255;
  const angleThreshold = 0.5;
  const angleDiffThreshold = 0.15;
  const pucksAsRobots = false;

  const puckSensorRadius = 4;
  const puckSensorDistance = 20;
  const puckSensorAngularWidth = 2 * Math.atan(puckSensorRadius / puckSensorDistance);

  const ROBOT_STATE = {
    SEARCH_SPIN: 'SEARCH_SPIN',
    SEARCH_STRAIGHT: 'SEARCH_STRAIGHT',
    FOLLOW_CURVE: 'FOLLOW_CURVE',
    ABOUT_FACE: 'ABOUT_FACE',
    TURN_TO_STRIKE: 'TURN_TO_STRIKE',
    RECOVERY_TURN: 'RECOVERY_TURN',
    DEBUG_STOP: 'DEBUG_STOP'
  };

  const CHIRALITY_STATE = {
    UNKNOWN: 'UNKNOWN',
    CW: 'CW',
    CCW: 'CCW'
  };

  let state = ROBOT_STATE.FOLLOW_CURVE;
  let chirality = CHIRALITY_STATE.UNKNOWN;
  let stepsInState = 0;
  let stepsInChirality = 0;
  let dwellSteps = 0;
  let turnDirection = 1;
  let desiredAngle = 0;
  let relativeGoalAngle = 0;

  if (onLoop) {
    const func = eval(onLoop);

    if (func && typeof func === 'function') {
      return func;
    }
  }

  return (sensors) => {

    // Scale the given value from the scale of src to the scale of dst.
    function scale(val, srcMin, srcMax, dstMin, dstMax) {
      return ((val - srcMin) / (srcMax - srcMin)) * (dstMax - dstMin) + dstMin;
    }

    function sign(x) {
      if (x > 0)
        return 1;
      else if (x < 0)
        return -1;
      else
        return 0;
    }

    function setNewState(new_state) {
      state = new_state;
      stepsInState = 0;
      //console.log("STATE: " + state);
    }

    function updateChirality(sensors) {
      let sensedChiralityMarker = (sensors.fields.readings.heatMap.edge)[2] / 255;
      let newChirality = chirality;
      if (Math.abs(sensedChiralityMarker - 1) < 0.1) {
        newChirality = CHIRALITY_STATE.CCW;
      } else if (Math.abs(sensedChiralityMarker - 0.498) < 0.1) {
        newChirality = CHIRALITY_STATE.CW;
      }

      // Did we actually change chirality?
      if (newChirality != chirality) {
        chirality = newChirality;
        stepsInChirality = 0;
        //console.log("CHIRALITY: " + chirality);
      }
    }

    function forceToggleChirality() {
      // Now allowing this to be called when the chirality is unknown.  We
      // just allow it to stay unknown.
      // assert(chirality != CHIRALITY_STATE.UNKNOWN);

      if (chirality == CHIRALITY_STATE.CW)
        chirality = CHIRALITY_STATE.CCW;
      else if (chirality == CHIRALITY_STATE.CCW)
        chirality = CHIRALITY_STATE.CW;

      stepsInChirality = 0;
    }

    function pucksInSwath(sensors, lowAngle, highAngle, SIDE) {
      let total = 0;
      let nSensorRegions = Object.keys(sensors.circles).length;
      let deltaAngle = 2 * Math.PI / nSensorRegions;

      for (let i = 0; i < nSensorRegions; ++i) {
        let angle = normalizeAnglePlusMinusPi(i * deltaAngle);
        //console.log("i: " + i + ", pucks: " + sensors.circles[`index${i}`].reading.pucks + ", " +
        //  (angle - 0.5 * puckSensorAngularWidth >= lowAngle && angle + 0.5 * puckSensorAngularWidth <= highAngle));

        if (angle - 0.5 * puckSensorAngularWidth >= lowAngle && angle + 0.5 * puckSensorAngularWidth <= highAngle) {
          total += sensors.circles[`index${i}`].reading.pucks;
          if (SIDE == "left") {
            sensors.circles[`index${i}`].reading.robots = 100;
          } else if (SIDE == "right") {
            sensors.circles[`index${i}`].reading.walls = 100;
          }
        }
      }

      return total;
    }

    sensors.goalVis = sensors.position;

    let command = { linearVel: 0, angularVel: 0, type: robot.SPEED_TYPES.RELATIVE };

    if (!sensors.fields.readings.heatMap.left
      || !sensors.fields.readings.heatMap.centre
      || !sensors.fields.readings.heatMap.right) {
      return command;
    }

    const l = (sensors.fields.readings.heatMap.left)[0] / 255;
    const c = (sensors.fields.readings.heatMap.centre)[0] / 255;
    const r = (sensors.fields.readings.heatMap.right)[0] / 255;
    //console.log("l, c, r: %g, %g, %g", l, c, r);

    let L = l > onCurveThreshold;
    let C = c > onCurveThreshold;
    let R = r > onCurveThreshold;
    let onCurve = C && (!R || !L);
    let offCurve = !C && !R && !L;

    //
    // Handle state transitions...
    //

    // This is reset whenever a new state is set, which should only be done by
    // calling setNewState.
    ++stepsInState;

    // This is reset whenever the chirality changes.
    ++stepsInChirality;

    if (state == ROBOT_STATE.SEARCH_SPIN) {
      if (onCurve) {
        setNewState(ROBOT_STATE.FOLLOW_CURVE);
      } else if (stepsInState > dwellSteps) {
        setNewState(ROBOT_STATE.SEARCH_STRAIGHT);
        dwellSteps = Math.ceil(searchStraightDistMin + (searchStraightDistMax - searchStraightDistMin) * Math.random());
      }

    } else if (state == ROBOT_STATE.SEARCH_STRAIGHT) {
      if (onCurve) {
        setNewState(ROBOT_STATE.FOLLOW_CURVE);
      } else if (sensors.polygons.ahead.reading.robots > 0 || stepsInState > dwellSteps) {
        setNewState(ROBOT_STATE.SEARCH_SPIN);
        dwellSteps = Math.ceil(searchSpinDistMin + (searchSpinDistMax - searchSpinDistMin) * Math.random());
      }

    } else if (state == ROBOT_STATE.FOLLOW_CURVE) {

      updateChirality(sensors);

      if (offCurve) {
        setNewState(ROBOT_STATE.SEARCH_SPIN);
        dwellSteps = Math.ceil(searchSpinDistMin + (searchSpinDistMax - searchSpinDistMin) * Math.random());

      } else if (onCurve && sensors.polygons.ahead.reading.robots > 0 && stepsInChirality > 10) {
        forceToggleChirality();
        setNewState(ROBOT_STATE.ABOUT_FACE);
        turnDirection = 1; // This is arbitrary.  Could be -1.

      } else if (onCurve && chirality != CHIRALITY_STATE.UNKNOWN && stepsInState > 10) {

        // Fill this with the info from the swath with the most pucks.
        let bestSwath = null;

        // Decode the value in reading.floorCentre.
        let rawValue = (sensors.fields.readings.heatMap.centre)[0];
        let relativeGoalAngle = scale(rawValue, minCurveIntensity, 255, -Math.PI, Math.PI);
        //console.log("raw: " + rawValue + ", scaled: " + relativeGoalAngle);
        if (chirality == CHIRALITY_STATE.CCW)
          relativeGoalAngle = normalizeAnglePlusMinusPi(relativeGoalAngle + Math.PI);

        // For visualization
        let vecLength = 100;
        sensors.goalVis = {x: sensors.position.x + vecLength * Math.cos(sensors.orientation + relativeGoalAngle), 
                           y: sensors.position.y + vecLength * Math.sin(sensors.orientation + relativeGoalAngle)};

        let leftSwath = pucksInSwath(sensors, -Math.PI, relativeGoalAngle - angleThreshold, "left");
        let rightSwath = pucksInSwath(sensors, relativeGoalAngle + angleThreshold, Math.PI, "right");
        //console.log('leftSwath, rightSwath: ' + leftSwath + ", " + rightSwath);
        if (leftSwath > 0 && leftSwath >= rightSwath) {
          bestSwath = "left";
          relativeGoalAngle -= angleThreshold;
        } else if (rightSwath > 0) {
          bestSwath = "right";
          relativeGoalAngle += angleThreshold;
        }

        if (bestSwath != null) {
          // Prepare to strike!
          setNewState(ROBOT_STATE.TURN_TO_STRIKE);
          if (bestSwath == "left") {
            turnDirection = 1;
            desiredAngle = sensors.orientation + turnDirection * (relativeGoalAngle + Math.PI);
          } else {
            turnDirection = -1;
            desiredAngle = sensors.orientation + turnDirection * (Math.PI - relativeGoalAngle);
          }
        }
      }

    } else if (state == ROBOT_STATE.ABOUT_FACE) {
      if (stepsInState > minTurnSteps && C) {
        setNewState(ROBOT_STATE.FOLLOW_CURVE);
      } else if (stepsInState > 100) {
        // We've perhaps been bumped off the curve.  Give up and search.
        setNewState(ROBOT_STATE.SEARCH_SPIN);
        dwellSteps = Math.ceil(searchSpinDistMin + (searchSpinDistMax - searchSpinDistMin) * Math.random());
      }

    }

    else if (state == ROBOT_STATE.TURN_TO_STRIKE) {
      if (getAngularDifference(desiredAngle, sensors.orientation) < angleDiffThreshold) {
        setNewState(ROBOT_STATE.RECOVERY_TURN);
        if (turnDirection == 1)
          desiredAngle = sensors.orientation - (relativeGoalAngle + Math.PI);
        else
          desiredAngle = sensors.orientation + (Math.PI - relativeGoalAngle);

        if (pucksAsRobots) {
          // This is to test the idea of being unable to sense the difference between
          // pucks and robots.  So whenever we recover from the strike, we set the
          // desired angle as above, but without the addition of pi, leading to this
          // single expression.
          desiredAngle = sensors.orientation - relativeGoalAngle;
          forceToggleChirality();
        }
        turnDirection *= -1;
      }
else {
//console.log("diff: " + getAngularDifference(desiredAngle, sensors.orientation));
}

    } else if (state == ROBOT_STATE.RECOVERY_TURN) {
      if (getAngularDifference(desiredAngle, sensors.orientation) < angleDiffThreshold) {
        setNewState(ROBOT_STATE.FOLLOW_CURVE);
      } 
else {
//console.log("diff: " + getAngularDifference(desiredAngle, sensors.orientation));
}
    }

    // 
    // Knowing what state we are in, act.
    // 

    // Forward speed v and angular speed w.  Will get further modified below.
    let v = 0;
    let w = 0;

    if (state == ROBOT_STATE.SEARCH_SPIN) {
      v = 0;
      w = 1;

    } else if (state == ROBOT_STATE.SEARCH_STRAIGHT) {
      v = 1;
      w = 0;

    } else if (state == ROBOT_STATE.ABOUT_FACE || state == ROBOT_STATE.TURN_TO_STRIKE || state == ROBOT_STATE.RECOVERY_TURN) {
      // We're in one of the TURN states.
      v = 0;
      w = turnDirection; // Technically, we could do without turnDirection
      // and just use w, but I think it adds clarity.

    } else if (state == ROBOT_STATE.DEBUG_STOP) {
      v = 0;
      w = 0;

    } else if (state == ROBOT_STATE.FOLLOW_CURVE) {
      let arbitraryTurn = -1;
      v = 1;
      if ( !L && !R && !C ) {
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

    //console.log("STATE: %s, CHIRALITY: %s: ", state, chirality);
    //console.log("angularSpeed: %g", angularSpeed);

    //console.log("x, y: " + sensors.position.x + ", " + sensors.position.y);
    //console.log("theta: " + sensors.orientation);

    command.linearVel = v * maxForwardSpeed * robot.velocityScale;
    command.angularVel = w * maxAngularSpeed * robot.velocityScale;

    sensors.state = state;

    //command.linearVel = 0;
    //command.angularVel = 0;
    return command;
  };
}