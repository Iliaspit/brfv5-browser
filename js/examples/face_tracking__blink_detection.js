/**
 * BRFv5 - Simple Blink Detection
 *
 * A simple approach with quite a lot false positives. Fast movement isn't handled
 * properly. Though this code is quite good when it comes to staring contest apps.
 *
 * For the last 13 frames (0.433 seconds at 30 FPS) it records the distance between
 * upper and lower lid. It looks at the first 3, the middle 3 and the last 3 frames
 * and compares the distances. If the middle segment is smaller than the other two,
 * it's a blink. This lags 0.25 seconds behind, but is instant enough in most cases.
 *
 * Only a 68 landmarks model is able to detect blinks.
 */

import { setupExample } from "./setup__example.js";
import { trackCamera } from "./setup__example.js";

// import { drawCircles } from "../utils/utils__canvas.js";
// import { drawFaceDetectionResults } from "../utils/utils__draw_tracking_results.js";
import { detectBlink } from "../utils/utils__blink_detection.js";
import { blinkTracker } from "../utils/utils__blink_tracker.js";

import { brfv5 } from "../brfv5/brfv5__init.js";
import { colorPrimary, colorSecondary } from "../utils/utils__colors.js";

let _leftEyeBlinked = false;
let _rightEyeBlinked = false;

let _leftEyeTimeOut = -1;
let _rightEyeTimeOut = -1;

const _leftEyeLidDistances = [];
const _rightEyeLidDistances = [];

// const _images = [
//   {
//     url: "./assets/brfv5_img_lion.png",
//     alpha: 0.66,
//     scale: 0.66,
//     xOffset: 0.5,
//     yOffset: 0.4,
//   },
//   {
//     url: "./assets/brfv5_img_glasses.png",
//     alpha: 1.0,
//     scale: 0.25,
//     xOffset: 0.5,
//     yOffset: 0.45,
//   },
// ];

export const configureExample = (brfv5Config) => {
  // No special configuration necessary, defaults are fine.
};

export const handleTrackingResults = (brfv5Manager, brfv5Config, canvas) => {
  const ctx = canvas.getContext("2d");
  const faces = brfv5Manager.getFaces();

  // let doDrawFaceDetection = false;

  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];

    if (face.state === brfv5.BRFv5State.FACE_TRACKING) {
      // drawCircles(ctx, face.landmarks, colorPrimary, 2.0);

      // Select the eye landmarks, then detect blinks for left and right individually:

      const lm = face.landmarks;
      const leftEyeLandmarks = [lm[36], lm[39], lm[37], lm[38], lm[41], lm[40]];
      const rightEyeLandmarks = [
        lm[45],
        lm[42],
        lm[44],
        lm[43],
        lm[46],
        lm[47],
      ];

      detectBlinkLeft(leftEyeLandmarks, _leftEyeLidDistances, ctx);

      detectBlinkRight(rightEyeLandmarks, _rightEyeLidDistances, ctx);

      // White for blink, blue for no blink:
      // drawCircles(
      //   ctx,
      //   leftEyeLandmarks,
      //   _leftEyeBlinked ? colorSecondary : colorPrimary,
      //   3.0
      // );
      // drawCircles(
      //   ctx,
      //   rightEyeLandmarks,
      //   _rightEyeBlinked ? colorSecondary : colorPrimary,
      //   3.0
      // );
    } else {
      _leftEyeLidDistances.length = 0;
      _rightEyeLidDistances.length = 0;

      // doDrawFaceDetection = true;
    }
  }

  // if (doDrawFaceDetection) {
  //   drawFaceDetectionResults(brfv5Manager, brfv5Config, canvas);
  // }

  return false;
};

const detectBlinkLeft = (lm, distances) => {
  const blinked = detectBlink(
    lm[0],
    lm[1],
    lm[2],
    lm[3],
    lm[4],
    lm[5],
    distances
  );

  // Keep a blink status for 0.150 seconds, then reset:
  if (blinked && !_leftEyeBlinked) {
    // Set blinked! Reset after 150ms.

    _leftEyeBlinked = true;

    if (_leftEyeTimeOut > -1) {
      clearTimeout(_leftEyeTimeOut);
    }

    _leftEyeTimeOut = setTimeout(() => {
      _leftEyeBlinked = false;
    }, 150);

    if (blinkTracker.tracking()) {
      blinkTracker.addBlink();
      console.log("Blinking Running Average", blinkTracker.getMovingAvg());
    }
  }
};

const detectBlinkRight = (lm, distances) => {
  const blinked = detectBlink(
    lm[0],
    lm[1],
    lm[2],
    lm[3],
    lm[4],
    lm[5],
    distances
  );

  if (blinked && !_rightEyeBlinked) {
    // Set blinked! Reset after 150ms.

    _rightEyeBlinked = true;

    if (_rightEyeTimeOut > -1) {
      clearTimeout(_rightEyeTimeOut);
    }

    _rightEyeTimeOut = setTimeout(() => {
      _rightEyeBlinked = false;
    }, 150);

    if (blinkTracker.tracking()) {
      blinkTracker.addBlink();

      if (blinkTracker.shouldShowBiofeedback) {
        // document.getElementById("all-buttons").style.display = "none";
        document.getElementById("expanding-ball").style.display = "block";
      }
      //  else {

      // }
    // } else {
    //   // TEST ---------------------------------
    // }
  }
};

const exampleConfig = {
  onConfigure: configureExample,
  onTracking: handleTrackingResults,
};

// run() will be called automatically after 1 second, if run isn't called immediately after the script was loaded.
// Exporting it allows re-running the configuration from within other scripts.

let timeoutId = -1;

export const run = () => {
  clearTimeout(timeoutId);
  setupExample(exampleConfig);

  if (window.selectedSetup === "image") {
    trackImage("./assets/tracking/" + window.selectedImage);
  } else {
    trackCamera();
  }
};

timeoutId = setTimeout(() => {
  run();
}, 1000);

export default { run };
