// import createCsvWriter from "csv-writer";
// const csvWriter = createCsvWriter({
//   path: "out.csv",
//   header: [
//     { id: "runningBlinkAvg", title: "Blink Average" },
//     { id: "crossedThreshold", title: "Crossed Threshold" },
//   ],
// });

import {
  addEntry,
  calculateAvgBlinkRate,
} from "../utils/utils__add_to_local_storage.js";

export const blinkTracker = (() => {
  let avgInterval;
  let timerInterval;
  let benchmarkTimeout;
  let experimentTimeout;
  let delayingBlinkAdditionTimeout;
  let delayingBioFeedbackTimeout;
  let showingBiofeedback = false;
  let preventingBioFeedback;
  let benchmark = 0;
  let totalCount = 0;
  let trackingOn = false;
  let timer = 0;
  let isBenchmarking = false;
  let bioFeedbackPhase = false;
  let totalCountByTime = { 0: 0 };
  let isDelayingBlinkAddition = false;
  let isDelayingBioFeedback = false;
  // let currentSession = 0;

  // ---------------- ******* ----------------

  // RESET TOTAL ETC IN THE BEGINNING OF EACH PHASE
  // MAKE IT INSTEAD OF A MOVING AVERAGE THAT TAKES ACCOUNT THE TOTAL, AN AVERAGE
  // OF LAST 1 MINUTE

  // ---------------- ******* ----------------

  const isDelayingBlinkAdditionOn = () => isDelayingBlinkAddition;

  const isShowingBiofeedback = () => showingBiofeedback;
  const isPreventingBioFeedback = () => preventingBioFeedback;

  const calculateBlinkRate = () => {
    let blinkRate;

    if (timer <= 20000) {
      blinkRate = totalCount / timer;
    } else {
      const startingPointForTimer = timer - 20000;
      const startingPointForCount = totalCountByTime[startingPointForTimer];

      const countToBeUsed = totalCount - startingPointForCount;
      const timeToBeUsed = timer - startingPointForTimer;
      blinkRate = countToBeUsed / timeToBeUsed;
    }

    return blinkRate;
  };

  const resetMetrics = () => {
    totalCountByTime = { 0: 0 };
    totalCount = 0;
    timer = 0;
    preventingBioFeedback = false;
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
        blinkRate: calculateBlinkRate(),
        feedbackShown: isShowingBiofeedback(),
        benchmarking: isBenchmarking,
        benchmark: benchmark || null,
      });
    }, 200);

    benchmarkTimeout = setTimeout(() => {
      trackingOn = false;
      isBenchmarking = false;
      benchmark = calculateAvgBlinkRate();

      addEntry({
        timer,
        blinkRate: calculateBlinkRate(),
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
    }, 180000);
  };

  const startPhaseWithBioFeedback = () => {
    isDelayingBioFeedback = true;
    isDelayingBlinkAddition = true;
    trackingOn = true;
    console.log("Bio feedback phase has begun");
    bioFeedbackPhase = true;

    avgInterval = setInterval(function () {
      timer += 200;
      totalCountByTime[timer] = totalCount;

      addEntry({
        timer,
        blinkRate: calculateBlinkRate(),
        feedbackShown: isShowingBiofeedback(),
        benchmarking: isBenchmarking,
        benchmark: benchmark,
      });
    }, 200);

    delayingBioFeedbackTimeout = setTimeout(() => {
      isDelayingBioFeedback = false;
      clearTimeout(delayingBioFeedbackTimeout);
    }, 20000);

    delayingBlinkAdditionTimeout = setTimeout(() => {
      isDelayingBlinkAddition = false;
      clearTimeout(delayingBlinkAdditionTimeout);
    }, 1500);

    benchmarkTimeout = setTimeout(() => {
      trackingOn = false;
      clearInterval(avgInterval);
      clearTimeout(benchmarkTimeout);
      bioFeedbackPhase = false;
      resetMetrics();

      console.log("Bio feedback phase has been completed");
    }, 300000);
  };

  const startPhaseWithoutBioFeedback = () => {
    isDelayingBlinkAddition = true;
    bioFeedbackPhase = false;
    trackingOn = true;
    console.log("Non Bio feedback phase has begun");

    avgInterval = setInterval(function () {
      timer += 200;
      totalCountByTime[timer] = totalCount;

      addEntry({
        timer,
        blinkRate: calculateBlinkRate(),
        feedbackShown: false,
        benchmarking: isBenchmarking,
        benchmark: benchmark,
      });
    }, 200);

    delayingBlinkAdditionTimeout = setTimeout(() => {
      isDelayingBlinkAddition = false;
      clearTimeout(delayingBlinkAdditionTimeout);
    }, 1500);

    benchmarkTimeout = setTimeout(() => {
      trackingOn = false;
      clearInterval(avgInterval);
      clearTimeout(benchmarkTimeout);
      resetMetrics();

      console.log("Non Bio feedback phase has been completed");
    }, 300000);
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
    if (trackingOn && !isDelayingBlinkAdditionOn()) {
      totalCount += 1;
    }
  };

  const shouldShowBiofeedback = () =>
    !isDelayingBioFeedback &&
    totalCount !== 0 &&
    bioFeedbackPhase &&
    calculateBlinkRate() > benchmark;

  const startBiofeedbackTimer = () => {
    let bioFeedbackTimeout;
    showingBiofeedback = true;

    bioFeedbackTimeout = setTimeout(() => {
      showingBiofeedback = false;
      clearTimeout(bioFeedbackTimeout);
    }, 10000);
  };

  const startPreventionTimer = () => {
    let preventionTimer;
    preventingBioFeedback = true;

    preventionTimer = setTimeout(() => {
      preventingBioFeedback = false;
      clearTimeout(preventionTimer);
    }, 30000);
  };

  return {
    startTrackingForBenchmark,
    startPhaseWithBioFeedback,
    startPhaseWithoutBioFeedback,
    stopTracking,
    addBlink,
    getCount: () => totalCount,
    getBlinkRate: () => calculateBlinkRate(),
    isBenchmarking: () => isBenchmarking,
    shouldShowBiofeedback,
    isPreventingBioFeedback: () => isPreventingBioFeedback(),
    startBiofeedbackTimer,
    startPreventionTimer,
    isShowingBiofeedback: () => isShowingBiofeedback(),
    tracking: () => trackingOn,
    benchmark: () => benchmark,
  };
})();
