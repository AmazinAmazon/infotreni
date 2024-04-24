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
    attribution: '<a href="http://www.openrailwaymap.org/">OpenRailwayMap</a>'
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
/* map.on("click", function(ev) {
    var latlng = map.mouseEventToLatLng(ev.originalEvent);
    console.log(latlng.lat, latlng.lng);
    L.marker([latlng.lat, latlng.lng])
    .addTo(map)
    .bindPopup("Clicked here");
}) */

var delay = 2000;
var lastClick = 0;
var displayData = document.getElementById("searchInfo");
var loadingIcon = document.getElementById("searchLoading");
var selectedStation = [];
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
  
  fetch(`https://api.openrailwaymap.org/v2/facility?name=${station}&limit=6`)
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    if (data[0] == null) {
      displayData.classList.replace("text-bg-dark", "text-bg-danger");
      displayData.innerHTML =
      "Nessuna stazione trovata, provate di nuovo tra 2 secondi";
    }
    for (const key in data) { // Iterates over each key in the json response
      let keyStnName = data[key]["name"];
      let keyStnOperator = data[key]["operator"];
      let stnName;
      
      if (keyStnOperator == undefined | keyStnOperator == "") {
        stnName = keyStnName
      } else {
        stnName = `${keyStnName} [${keyStnOperator}]`
      }
      
      if (displayData.innerHTML.indexOf(stnName) == -1) {
        displayData.innerHTML += `<button class="btn btn-outline-warning btn-sm m-1" onclick="stnBtnClick(${data[key]['latitude']}, ${data[key]['longitude']}, this.innerText)">${stnName}</button>`;
      }
    }
  })
  .catch((error) => {
    displayData.classList.replace("text-bg-dark", "text-bg-danger");
    displayData.innerHTML = "Errore, riprovate tra 2 secondi: " + error.message;
  })
  .finally(() => {
    loading.classList.add("visually-hidden");
  });
}

function stnBtnClick(lon, lat, stnName) {
  selectedStation = []
  markersGrp.clearLayers();
  
  L.marker([lat, lon]).addTo(markersGrp);
  
  map.setView([lat, lon], 14);
  selectedStation.push(lat, lon, stnName)
  console.log(selectedStation)
}

function onReturnSearch(event, obj) {
  if (event.keyCode === 13) {
    refreshSearch(obj.value)
  }
}

function inviaSegn(trnInfo) {
  if (trnInfo == "") {
    trnInfo = null
  }
  console.log(trnInfo)
}