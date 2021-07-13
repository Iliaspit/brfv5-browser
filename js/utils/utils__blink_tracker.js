// import createCsvWriter from "csv-writer";
// const csvWriter = createCsvWriter({
//   path: "out.csv",
//   header: [
//     { id: "runningBlinkAvg", title: "Blink Average" },
//     { id: "crossedThreshold", title: "Crossed Threshold" },
//   ],
// });

import { addEntry } from "../utils/utils__add_to_local_storage.js";

export const blinkTracker = (() => {
  let avgInterval;
  let timerInterval;
  let benchmarkTimeout;
  let experimentTimeout;
  let benchmark;
  let totalCount = 0;
  let trackingOn = false;
  let timer = 0;
  let movingAvg;
  let isBenchmarking = false;
  let bioFeedbackPhase = false;
  // let currentSession = 0;

  // ---------------- ******* ----------------

  // RESET TOTAL ETC IN THE BEGINNING OF EACH PHASE
  // MAKE IT INSTEAD OF A MOVING AVERAGE THAT TAKES ACCOUNT THE TOTAL, AN AVERAGE
  // OF LAST 1 MINUTE

  // ---------------- ******* ----------------

  const startTrackingForBenchmark = () => {
    // currentSession += 1;
    localStorage.clear();
    bioFeedbackPhase = false;
    isBenchmarking = true;
    trackingOn = true;
    console.log("Benchmarking has begun");

    avgInterval = setInterval(function () {
      timer += 200;
      movingAvg = totalCount / timer;

      addEntry({
        timer,
        movingAvg,
        feedbackShown: shouldShowBiofeedback(),
        benchmarking: isBenchmarking,
        benchmark: benchmark || null,
      });
    }, 200);

    benchmarkTimeout = setTimeout(() => {
      trackingOn = false;
      isBenchmarking = false;
      benchmark = movingAvg;

      addEntry({
        timer,
        movingAvg,
        feedbackShown: shouldShowBiofeedback(),
        benchmarking: isBenchmarking,
        benchmark: benchmark || null,
      });

      clearInterval(avgInterval);
      clearTimeout(benchmarkTimeout);

      console.log(
        "Benchmarking has been completed - the benchmark is:",
        benchmark
      );
    }, 10000);
  };

  const startPhaseWithBioFeedback = () => {
    trackingOn = true;
    console.log("Bio feedback phase has begun");
    bioFeedbackPhase = true;

    avgInterval = setInterval(function () {
      timer += 200;
      movingAvg = totalCount / timer;

      addEntry({
        timer,
        movingAvg,
        feedbackShown: shouldShowBiofeedback(),
        benchmarking: isBenchmarking,
        benchmark: benchmark,
      });
    }, 200);

    benchmarkTimeout = setTimeout(() => {
      trackingOn = false;
      clearInterval(avgInterval);
      clearTimeout(benchmarkTimeout);
      bioFeedbackPhase = false;

      console.log("Bio feedback phase has been completed");
    }, 300000);
  };

  const startPhaseWithoutBioFeedback = () => {
    bioFeedbackPhase = false;
    trackingOn = true;
    console.log("Non Bio feedback phase has begun");

    avgInterval = setInterval(function () {
      timer += 200;
      movingAvg = totalCount / timer;

      addEntry({
        timer,
        movingAvg,
        feedbackShown: false,
        benchmarking: isBenchmarking,
        benchmark: benchmark,
      });
    }, 200);

    benchmarkTimeout = setTimeout(() => {
      trackingOn = false;
      clearInterval(avgInterval);
      clearTimeout(benchmarkTimeout);

      console.log("Non Bio feedback phase has been completed");
    }, 10000);
  };

  const stopTracking = () => {
    localStorage.clear();
    trackingOn = false;
    clearInterval(avgInterval);
    clearInterval(timerInterval);
    clearTimeout(benchmarkTimeout);
    console.log("The experiment was stopped - all data have now been deleted");
  };

  const addBlink = () => {
    if (trackingOn) {
      totalCount += 1;
    }
  };

  const shouldShowBiofeedback = () => bioFeedbackPhase && movingAvg > benchmark;

  return {
    startTrackingForBenchmark,
    startPhaseWithBioFeedback,
    startPhaseWithoutBioFeedback,
    stopTracking,
    addBlink,
    getCount: () => totalCount,
    getMovingAvg: () => movingAvg,
    isBenchmarking: () => isBenchmarking,
    shouldShowBiofeedback,
    tracking: () => trackingOn,
    benchmark: () => benchmark,
  };
})();
