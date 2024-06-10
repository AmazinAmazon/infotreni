var osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy<a href="https://www.openstreetmap.org/copyright"> OpenStreetMap</a> contributors',
});
var openRailway = L.tileLayer(
  "http://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png",
  {
    minZoom: 2,
    maxZoom: 19,
    tileSize: 256,
    attribution: '<a href="http://www.openrailwaymap.org/">OpenRailwayMap</a>',
  }
);
var map = L.map("map", {
  center: [45.464664, 9.18854],
  zoom: 10,
  layers: [osm, openRailway],
});

// Can add more basemaps and overlays here
var baseMaps = {
  OpenStreetMap: osm,
};
var overlayMaps = {
  OpenRailwayMap: openRailway,
};

L.control.layers(baseMaps, overlayMaps).addTo(map);
var markersGrp = L.layerGroup().addTo(map);
// Function map on click
// map.on("click", function (ev) {
//   var latlng = map.mouseEventToLatLng(ev.originalEvent);
//   console.log(latlng.lat, latlng.lng);
//   L.marker([latlng.lat, latlng.lng]).addTo(map).bindPopup("Clicked here");
// });

var delay = 2000;
var lastClick = 0;
var displayData = document.getElementById("searchInfo");
var loadingIcon = document.getElementById("searchLoading");
var selectedInfo;
//var loadStreak = 0;

async function refreshSearch(station, loading = loadingIcon) {
  if (station === "") {
    return;
  }
  if (lastClick >= Date.now() - delay) {
    return;
  }

  displayData.innerHTML = "";
  displayData.className = "results m-1 rounded-2 text-center text-bg-dark";
  loading.classList.remove("visually-hidden");
  lastClick = Date.now();
  //https://nominatim.openstreetmap.org/?q=${station}[railway]&country=it&format=json&limit=6&extratags=1
  fetch(`https://nominatim.openstreetmap.org/search?amenity=${station}[railway=station]&amnety=${station}[railway=yard]&format=json&extratags=1`, {
    mode: "cors",
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data[0] == null) {
        displayData.classList.replace("text-bg-dark", "text-bg-danger");
        displayData.innerHTML =
          "Nessuna stazione trovata, provate di nuovo tra 2 secondi";
      }
      for (const key in data) {
        // Iterates over each key in the json response
        let keyStnName = data[key]["name"];
        //let keyStnOperator = data[key]["extratags"]["operator"];
        let stnName;

        if (data[key]["extratags"] && data[key]["extratags"]["operator"]) {
          let keyStnOperator = data[key]["extratags"]["operator"];
          
          switch (keyStnOperator) {
            case "Rete Ferroviaria Italiana":
              keyStnOperator = "RFI";
              break;
            case "Trenitalia":
              keyStnOperator = "TI";
              break;
            case "Azienda Trasporti Milanesi":
              keyStnOperator = "ATM";
              break;
            case "RFI - Rete Ferroviaria Italiana":
              keyStnOperator = "RFI";
              break;
          }
          stnName = `${keyStnName} [${keyStnOperator}]`;
        } else {
          stnName = keyStnName;
        }

        if (displayData.innerHTML.indexOf(stnName) == -1) {
          displayData.innerHTML += `<button type="button" class="btn btn-outline-warning btn-sm m-1" onclick="stnBtnClick(${data[key]["lon"]}, ${data[key]["lat"]}, this.innerText)">${stnName}</button>`;
        }
      }
    })
    .catch((error) => {
      displayData.classList.replace("text-bg-dark", "text-bg-danger");
      displayData.innerHTML =
        "Errore, riprovate tra 2 secondi: " + error.message;
      console.log(error);
    })
    .finally(() => {
      loading.classList.add("visually-hidden");
    });
}

function stnBtnClick(lon, lat, stnName) {
  selectedInfo = [];
  markersGrp.clearLayers();

  L.marker([lat, lon]).addTo(markersGrp);

  map.setView([lat, lon], 14);
  selectedInfo.push(lat, lon, stnName);
}

function onReturnSearch(event, obj) {
  if (event.keyCode === 13) {
    refreshSearch(obj.value);
  }
}

function inviaSegn(trnInfo) {
  if (trnInfo == "") {
    trnInfo = null;
  }
  selectedInfo[3] = trnInfo;
  if ((selectedInfo[0] == null) | (selectedInfo[3] == null)) {
    let finalError = document.getElementById("finalError");
    finalError.className = "align-middle text-decoration-underline text-danger";
    finalError.innerHTML =
      "Errore: selezionare una stazione e/o aggiungere una descrizione";
  } else {
    // add db post and add to table
    finalError.className =
      "align-middle text-decoration-underline text-success";
    finalError.innerHTML = "Segnalazione inviata";
    let now = new Date();
    selectedInfo[4] =
      now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();

    addToTable(selectedInfo);
  }
}

function addToTable(trainInfo) {
  const currentTableBody = document.getElementById("tableTest");

  currentTableBody.innerHTML += `<tr><td>${trainInfo[4]}</td><td>${
    trainInfo[2]
  }</td><td>${convertToPlain(trainInfo[3])}</td></tr>`;
}

function convertToPlain(htmlStr) {
  let tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlStr;
  return tempDiv.innerText;
}
