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
  let delayingTimeout;
  let showingBiofeedback = false;
  let benchmark;
  let totalCount = 0;
  let trackingOn = false;
  let timer = 0;
  let isBenchmarking = false;
  let bioFeedbackPhase = false;
  let totalCountByTime = { 0: 0 };
  let isDelaying = false;
  // let currentSession = 0;

  // ---------------- ******* ----------------

  // RESET TOTAL ETC IN THE BEGINNING OF EACH PHASE
  // MAKE IT INSTEAD OF A MOVING AVERAGE THAT TAKES ACCOUNT THE TOTAL, AN AVERAGE
  // OF LAST 1 MINUTE

  // ---------------- ******* ----------------

  const isDelayingOn = () => isDelaying;

  const isShowingBiofeedback = () => showingBiofeedback;

  const calculateMovAvg = () => {
    let movingAvg;

    if (timer <= 20000) {
      movingAvg = totalCount / timer;
    } else {
      const startingPointForTimer = timer - 20000;
      const startingPointForCount = totalCountByTime[startingPointForTimer];

      const countToBeUsed = totalCount - startingPointForCount;
      const timeToBeUsed = timer - startingPointForTimer;
      movingAvg = countToBeUsed / timeToBeUsed;
    }

    return movingAvg;
  };

  const resetMetrics = () => {
    totalCountByTime = { 0: 0 };
    totalCount = 0;
    timer = 0;
  };

  const startTrackingForBenchmark = () => {
    // currentSession += 1;
    localStorage.clear();
    bioFeedbackPhase = false;
    isBenchmarking = true;
    trackingOn = true;
    console.log("Benchmarking has begun");

    avgInterval = setInterval(function () {
      timer += 200;
      totalCountByTime[timer] = totalCount;

      addEntry({
        timer,
        movingAvg: calculateMovAvg(),
        feedbackShown: isShowingBiofeedback(),
        benchmarking: isBenchmarking,
        benchmark: benchmark || null,
      });
    }, 200);

    benchmarkTimeout = setTimeout(() => {
      trackingOn = false;
      isBenchmarking = false;
      benchmark = calculateMovAvg();

      addEntry({
        timer,
        movingAvg: calculateMovAvg(),
        feedbackShown: isShowingBiofeedback(),
        benchmarking: isBenchmarking,
        benchmark: benchmark || null,
      });

      clearInterval(avgInterval);
      clearTimeout(benchmarkTimeout);
      resetMetrics();

      console.log(
        "Benchmarking has been completed - the benchmark is:",
        benchmark
      );
    }, 60000);
  };

  const startPhaseWithBioFeedback = () => {
    isDelaying = true;
    trackingOn = true;
    console.log("Bio feedback phase has begun");
    bioFeedbackPhase = true;

    avgInterval = setInterval(function () {
      timer += 200;
      totalCountByTime[timer] = totalCount;

      addEntry({
        timer,
        movingAvg: calculateMovAvg(),
        feedbackShown: isShowingBiofeedback(),
        benchmarking: isBenchmarking,
        benchmark: benchmark,
      });
    }, 200);

    delayingTimeout = setTimeout(() => {
      isDelaying = false;
      clearTimeout(delayingTimeout);
    }, 1500);

    benchmarkTimeout = setTimeout(() => {
      trackingOn = false;
      clearInterval(avgInterval);
      clearTimeout(benchmarkTimeout);
      bioFeedbackPhase = false;
      resetMetrics();

      console.log("Bio feedback phase has been completed");
    }, 120000);
  };

  const startPhaseWithoutBioFeedback = () => {
    isDelaying = true;
    bioFeedbackPhase = false;
    trackingOn = true;
    console.log("Non Bio feedback phase has begun");

    avgInterval = setInterval(function () {
      timer += 200;
      totalCountByTime[timer] = totalCount;

      addEntry({
        timer,
        movingAvg: calculateMovAvg(),
        feedbackShown: false,
        benchmarking: isBenchmarking,
        benchmark: benchmark,
      });
    }, 200);

    delayingTimeout = setTimeout(() => {
      isDelaying = false;
      clearTimeout(delayingTimeout);
    }, 1500);

    benchmarkTimeout = setTimeout(() => {
      trackingOn = false;
      clearInterval(avgInterval);
      clearTimeout(benchmarkTimeout);
      resetMetrics();

      console.log("Non Bio feedback phase has been completed");
    }, 120000);
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
    if (trackingOn && !isDelayingOn()) {
      totalCount += 1;
    }
  };

  const shouldShowBiofeedback = () =>
    totalCount !== 0 && bioFeedbackPhase && calculateMovAvg() > benchmark;

  const startBiofeedbackTimer = () => {
    let bioFeedbackTimeout;
    showingBiofeedback = true;

    bioFeedbackTimeout = setTimeout(() => {
      showingBiofeedback = false;
      clearTimeout(bioFeedbackTimeout);
    }, 10000);
  };

  return {
    startTrackingForBenchmark,
    startPhaseWithBioFeedback,
    startPhaseWithoutBioFeedback,
    stopTracking,
    addBlink,
    getCount: () => totalCount,
    getMovingAvg: () => calculateMovAvg(),
    isBenchmarking: () => isBenchmarking,
    shouldShowBiofeedback,
    startBiofeedbackTimer,
    isShowingBiofeedback,
    tracking: () => trackingOn,
    benchmark: () => benchmark,
  };
})();
