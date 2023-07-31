// Store our API endpoint as queryUrl (Past 7 Days - All Earthquakes).
const EARTHQUAKE_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

// Perform a GET request to the query URL/
d3.json(EARTHQUAKE_URL).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

  // Define a function to determine the size of the data marker based on earthquake magnitude.
  function getMarkerSize(magnitude) {
    return magnitude * 5; // Adjust the scaling factor as needed for the desired marker size
  }

  // Define a function to determine the color of the data marker based on earthquake depth.
  function getColor(depth) {
    // Define the color range based on the depth values (adjust the depth ranges and colors as desired)
    return depth > 300 ? "#800026" :
           depth > 200 ? "#BD0026" :
           depth > 100 ? "#E31A1C" :
           depth > 50 ? "#FC4E2A" :
           depth > 20 ? "#FD8D3C" :
           depth > 10 ? "#FEB24C" :
                        "#FED976";
  }

function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    const magnitude = feature.properties.mag;
    const depth = feature.geometry.coordinates[2];

    const markerOptions = {
      radius: getMarkerSize(magnitude),
      fillColor: getColor(depth),
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
    };

    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(
      feature.properties.time
    )}</p><p>Magnitude: ${magnitude}<br>Depth: ${depth}</p>`);
    layer.setStyle(markerOptions);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    onEachFeature: onEachFeature,
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

  function createMap(earthquakes) {
  
    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    let satellite = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
    });

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Create a baseMaps object.
    let baseMaps = {
      "Satellite": satellite,
      "Street Map": street,
      "Topographic Map": topo  
    };
  
    // Create an overlay object to hold our overlay.
    let overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
      center: [
        47, -100
      ],
      zoom: 3.5,
      layers: [satellite, earthquakes]
    });
  
    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  
    // Create a legend control.
    let legend = L.control({ position: 'bottomright' });
    console.log(legend)

    // Define the legend's content.
    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend');
        let grades = [0, 10, 20, 50, 100, 200, 300]; // Depth ranges for the legend
        let labels = [];
        div.innerHTML = "<h3>Depth(km)</h3>";

        // Loop through the depth ranges and generate the HTML for the legend.
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '">&emsp;</i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + (grades[i + 1] - 1) + '<br>' : '+');
        }
        return div;
    };
    // Add the legend to the map.
    legend.addTo(myMap);
}

  

