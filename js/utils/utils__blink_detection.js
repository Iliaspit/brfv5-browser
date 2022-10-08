import { distance } from "./utils__geom.js";

export const detectBlink = (
  eyeOuterCorner,
  eyeInnerCorner,
  eyeOuterUpperLid,
  eyeInnerUpperLid,
  eyeOuterLowerLid,
  eyeInnerLowerLid,
  eyeLidDistances
) => {
  const eyeWidth = distance(eyeOuterCorner, eyeInnerCorner);
  const eyeOuterLidDistance = distance(eyeOuterUpperLid, eyeOuterLowerLid);
  const eyeInnerLidDistance = distance(eyeInnerUpperLid, eyeInnerLowerLid);
  const eyeLidDistance = 2.0 * ((eyeOuterLidDistance + eyeInnerLidDistance) / eyeWidth);

  eyeLidDistances.push(eyeLidDistance);

  /**
   * Not very sure why we have chosen 13 as opposed to a higher number? 
   * How was the choice of 13 made?
   * */
  while (eyeLidDistances.length > 13) { // keep 13.0/30.0=0.433 seconds of recording data

    eyeLidDistances.shift();
  }

  if (eyeLidDistances.length === 13) {

    let segment0 = 0;
    let segment1 = 0;
    let segment2 = 0;

    let i;

    /**
     * Another question is in the array where we are keeping the eyeLidDistances, since we are looking
     * at continuous movement, why do we have a gap between the values we are using? For example in the
     * for loops below, the second and third loop do not start at 3 and 8 respectively but every time
     * the detectBlink function is used, there are 2 measurements that are skipped. What I mean is that
     * in the following distance measurements array:
     * [d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13]
     * we are alaways ommitting d4, d5 and d9, d10. Why do we do that?
     * */
    for (i = 0; i < 3; i++) { segment0 += eyeLidDistances[i]; }
    for (i = 5; i < 8; i++) { segment1 += eyeLidDistances[i]; }
    for (i = 10; i < 13; i++) { segment2 += eyeLidDistances[i]; }

    /**
     * finds an average for each segment (each one of these averages represents a state (closed/ open))
     * */
    segment0 /= 3.0;
    segment1 /= 3.0;
    segment2 /= 3.0;

    /**
     * Where is the 0.12 coming from? Does an absolute distance of >= 0.12 mean
     * that the eye is not closed enough?
    * */
    if (Math.abs(segment0 - segment2) < 0.12) {
      const outerSegments = (segment0 + segment2) * 0.5;
      const percent = segment1 / outerSegments;

      if (segment1 < segment0 && segment1 < segment2 && percent < 0.88) { // where is the 0.88 coming from?

        return true;
      }
    }
  }

  return false;
};

export default { detectBlink };
