import { blinkTracker } from "./utils__blink_tracker";

export const writeBlinkData = ({ event }) => {
  const url = "http://localhost:3000";
  let path;
  let str;
  const movingAvg = blinkTracker.getMovingAvg();
  const displayingFeedback = blinkTracker.shouldShowBiofeedback();

  const data = {
    movingAvg,
    displayingFeedback,
  };

  //   const options = {
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   };

  //   switch (event) {
  //     case "phase1Completed":
  //       path = "benchmarkFound";

  //     case "phase2":
  //       path = "biofeedback";
  //       str = "bio feedback session begins";
  //       method = "GET";

  //     default:
  //       method = "POST";
  //       options.body = JSON.stringify(data),
  //   }

  //   options.method = method;

  //   fetch(`${url}/${path}`).then(function (response) {
  //     if (response.status >= 400) {
  //       throw new Error("Bad response from server");
  //     }
  //     //   return response.json();
  //     if (response.status === 200) {
  //       console.log(`${event || 'moving avg'} entry successfully recorded`);
  //     }
  //   });
};

// After they download it then we work with it
function convertToCSV(objArray) {
  var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
  var str = "";

  for (var i = 0; i < array.length; i++) {
    var line = "";
    for (var index in array[i]) {
      if (line != "") line += ",";

      line += array[i][index];
    }

    str += line + "\r\n";
  }

  return str;
}

function exportCSVFile(headers, items, fileTitle) {
  if (headers) {
    items.unshift(headers);
  }

  // Convert Object to JSON
  var jsonObject = JSON.stringify(items);

  var csv = this.convertToCSV(jsonObject);

  var exportedFilenmae = fileTitle + ".csv" || "export.csv";

  var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, exportedFilenmae);
  } else {
    var link = document.createElement("a");
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", exportedFilenmae);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
