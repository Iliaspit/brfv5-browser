export function addEntry(entries) {
  // Parse the JSON stored in allEntries
  var existingEntries = JSON.parse(localStorage.getItem("allEntries"));
  if (existingEntries == null) existingEntries = [];

  // Save allEntries back to local storage
  existingEntries.push(entries);
  localStorage.setItem("allEntries", JSON.stringify(existingEntries));
  //   console.log(JSON.parse(localStorage.getItem("allEntries")));
}

export function calculateAvgBlinkRate() {
  var existingEntries = JSON.parse(localStorage.getItem("allEntries"));

  var reducer = (accumulator, currentValue) => {
    if (
      !isNaN(currentValue.blinkRate) &&
      typeof currentValue.blinkRate !== "undefined" &&
      typeof currentValue.blinkRate === "number"
    ) {
      return accumulator + Number(currentValue.blinkRate);
    }
    return accumulator;
  };

  var totalBlinkRate = existingEntries.reduce(reducer, 0);
  var avgBlinkRate = totalBlinkRate / existingEntries.length;
  return avgBlinkRate;
}
