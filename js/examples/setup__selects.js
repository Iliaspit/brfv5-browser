import { blinkTracker } from "../utils/utils__blink_tracker.js";

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
  // var jsonObject = JSON.parse(items);
  // if (headers) {
  //   jsonObject.unshift(headers);
  // }

  // Convert Object to JSON
  // var jsonObjectStr = JSON.stringify(items);

  var csv = convertToCSV(items);

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

// var headers = {
//   timer, // remove commas to avoid errors
//   movingAvg,
//   feedbackShown,
//   benchmarking,
//   benchmark,
// };

const switchSetup = (selectedSetup) => {
  console.log("switchSetup", selectedSetup, window.selectedSetup);

  if (selectedSetup === "camera" || selectedSetup === "image") {
    if (selectedSetup !== window.selectedSetup) {
      window.selectedSetup = selectedSetup;

      switchExample(selectExample.value);
    }
  } else {
    if (window.selectedSetup !== "camera") {
      window.selectedSetup = "camera";

      switchExample(selectExample.value);
    }
  }
};

const switchImage = (selectedImage) => {
  console.log("switchImage", selectedImage);

  if (selectedImage !== window.selectedImage) {
    window.selectedImage = selectedImage;

    if (window.selectedSetup === "image") {
      switchExample(selectExample.value);
    }
  }
};

const switchExample = (selectedExample) => {
  console.log("switchExample", selectedExample);

  const tmp = selectedExample.split("#");
  let numFaces = "";

  if (tmp.length > 1) {
    selectedExample = tmp[0];
    numFaces = tmp[1];
  }

  const scriptSwitch = document.getElementById("scriptSwitchExample");

  if (scriptSwitch) {
    scriptSwitch.parentNode.removeChild(scriptSwitch);
  }

  const path = "./js/examples/" + selectedExample + ".js";

  const script = document.createElement("script");
  script.id = "scriptSwitchExample";
  script.type = "module";
  script.async = true;
  script.innerHTML =
    'import { run } from "' + path + '"; run(' + numFaces + ")";

  document.body.append(script);

  const codeNode = document.getElementById("__brfv5_code");

  if (codeNode) {
    const txtRequest = new XMLHttpRequest();
    txtRequest.open("GET", path);
    txtRequest.onload = function (e) {
      codeNode.innerHTML = txtRequest.responseText;

      document.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightBlock(block);
      });
    };

    txtRequest.send();
  }
};

const getURLParameter = (url, param) => {
  if (url.includes("?")) {
    const splitURL = url.split("?");
    const splitParams = splitURL[1].split("&");

    for (let i = 0; i < splitParams.length; i++) {
      const splitParam = splitParams[i].split("=");

      if (splitParam[0] === param) {
        return splitParam[1];
      }
    }
  }

  return null;
};

const preselectThreeJS = (select) => {
  const modelType = getURLParameter(window.location.search, "type");

  let setSelected = false;

  if (modelType === "42l") {
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].value.toLowerCase().includes("threejs")) {
        select.selectedIndex = i;
        setSelected = true;
        break;
      }
    }
  }

  // if(!setSelected) {
  //
  //   for(let i = 0; i < selectContainers.length; i++) {
  //
  //     const selectContainer = selectContainers[i]
  //     const select = selectContainer.getElementsByTagName('select')[0]
  //
  //     select.selectedIndex = 2
  //   }
  // }
};

const closeAllSelect = (selectedItem) => {
  /* A function that will close all select boxes in the document, except the current select box: */

  const allOptionsContainers = document.getElementsByClassName("select-items");
  const allSelectedItems = document.getElementsByClassName("select-selected");
  const tmp = [];

  for (let i = 0; i < allSelectedItems.length; i++) {
    if (selectedItem === allSelectedItems[i]) {
      tmp.push(i);
    } else {
      allSelectedItems[i].classList.remove("select-arrow-active");
    }
  }

  for (let i = 0; i < allOptionsContainers.length; i++) {
    if (tmp.indexOf(i)) {
      allOptionsContainers[i].classList.add("select-hide");
    }
  }
};

const setupSelect = (select, onSelect) => {
  const selectContainer = select.parentNode;

  /* For each element, create a new DIV that will act as the selected item: */

  const selectedItem = document.createElement("div");
  selectedItem.innerHTML = select.options[select.selectedIndex].innerHTML;
  selectedItem.className = "select-selected";
  selectContainer.appendChild(selectedItem);

  /* For each element, create a new DIV that will contain the option list: */

  const optionsContainer = document.createElement("div");
  optionsContainer.className = "select-items select-hide";

  const optionMap = {};

  for (let i = 0; i < select.options.length; i++) {
    /* For each option in the original select element, create a new DIV that will act as an option item: */

    const option = document.createElement("div");
    option.innerHTML = select.options[i].innerHTML;

    if (option.innerHTML === selectedItem.innerHTML) {
      option.classList.add("same-as-selected");
    }

    option.addEventListener("click", function (event) {
      /* When an item is clicked, update the original select box, and the selected item: */

      selectedItem.innerHTML = this.innerHTML;
      select.selectedIndex = optionMap[this.innerHTML];

      onSelect(select.value);

      const oldOption = selectContainer.getElementsByClassName(
        "same-as-selected"
      );
      if (oldOption && oldOption[0])
        oldOption[0].classList.remove("same-as-selected");

      this.classList.add("same-as-selected");
      selectedItem.click();
    });
    optionMap[option.innerHTML] = i;
    optionsContainer.appendChild(option);
  }

  selectContainer.appendChild(optionsContainer);

  selectedItem.onclick = function (event) {
    /* When the select box is clicked, close any other select boxes, and open/close the current select box: */

    event.stopPropagation();

    closeAllSelect(this);

    optionsContainer.classList.toggle("select-hide");
    selectedItem.classList.toggle("select-arrow-active");
  };

  /* If the user clicks anywhere outside the select box, then close all select boxes: */

  document.addEventListener("click", closeAllSelect);
};

const setupButtons = (button, btnType) => {
  button.addEventListener("click", function (event) {
    event.preventDefault();
    if (btnType == "green") {
      if (
        this.classList.value !== "disabled" &&
        !blinkTracker.tracking() &&
        !blinkTracker.benchmark()
      ) {
        this.classList.add("disabled");
        event.target.style.backgroundColor = "white";
        blinkTracker.startTrackingForBenchmark();
      }
    } else if (
      btnType === "blue" &&
      !blinkTracker.tracking() &&
      blinkTracker.benchmark()
    ) {
      if (this.classList.value !== "disabled") {
        this.classList.add("disabled");
        event.target.style.backgroundColor = "white";

        blinkTracker.startPhaseWithoutBioFeedback();
      }
    } else if (
      btnType === "purple" &&
      !blinkTracker.tracking() &&
      blinkTracker.benchmark()
    ) {
      if (this.classList.value !== "disabled") {
        this.classList.add("disabled");
        event.target.style.backgroundColor = "white";

        blinkTracker.startPhaseWithBioFeedback();
      }
    } else if (btnType === "download") {
      const data = localStorage.getItem("allEntries");

      exportCSVFile(null, data, "some-csv-example");
      // const options = {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: data,
      // };

      // const url = "http://localhost:3000/downloadCSV";

      // fetch(url, options)
      //   .then((res) => {
      //     console.log("Response for download was ", res.status);
      //   })
      //   .catch((err) => console.log("hiilias error:", err));
    }
  });
};

const selectExample = document.getElementById("__brfv5_select_example");
const selectSetup = document.getElementById("__brfv5_select_setup");
const selectImage = document.getElementById("__brfv5_select_image");

const buttonGreen = document.getElementById("__btn_green");
const buttonBlue = document.getElementById("__btn_blue");
const buttonPurple = document.getElementById("__btn_purple");
const buttonDownload = document.getElementById("__btn_download");

preselectThreeJS(selectExample);

setupSelect(selectExample, switchExample);
setupSelect(selectSetup, switchSetup);

setupButtons(buttonGreen, "green");
setupButtons(buttonBlue, "blue");
setupButtons(buttonPurple, "purple");
setupButtons(buttonDownload, "download");

// switchExample(selectExample.value)
switchSetup(selectSetup.value);
switchImage(selectImage.value);
