// Get the data for earthquakes in the past 7 days
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Create a map object.
let map = L.map("map", {
    center: [37.0902, -95.7129],
    zoom: 5
});

// Add a tile layer.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Get the data from the url with D3
d3.json(url).then(data => {
    let eqData = data.features
    let depthData = []

    // Function to determine the color of the circles based on depth value
    function depthColor(size) {
        if (size < 10) {
            return "rgb(0, 255, 0)"
        } else if (size >= 10 && size < 30) {
            return "rgb(204, 255, 153)"
        } else if (size >= 30 && size < 50) {
            return "rgb(255, 204, 153)"
        } else if (size >= 50 && size < 70) {
            return "rgb(255, 153, 51)"
        } else if (size >= 70 && size < 90) {
            return "rgb(255, 128, 0)"
        } else {
            return "rgb(255, 0, 0)"
        }
    }

    // Loop through each feature and draw the circle on the lat and long values
    for (let i = 0; i < eqData.length; i++) {

        // This collects the depth value for the current feature
        depthData.push(eqData[i].geometry.coordinates[2])

        // Create a circle for this earthquake data
        L.circle([eqData[i].geometry.coordinates[1], eqData[i].geometry.coordinates[0]], {
            fillOpacity: 0.75,
            color: "white",
            fillColor: depthColor(eqData[i].geometry.coordinates[2]),
            // Adjust the radius.
            radius: Math.pow(eqData[i].properties.mag + 5, 2) * 500
        }).bindPopup(

            // Setup the popup for the markers
            `<h2>Magnitude: ${eqData[i].properties.mag}</h2>
            <hr>
            <h3>Latitude: ${eqData[i].geometry.coordinates[1]}</h3> 
            <h3>Longitude: ${eqData[i].geometry.coordinates[0]}</h3>
            <h3>Date: ${new Date(eqData[i].properties.time).toLocaleDateString("en-US")}</h3>
            <h3>Depth: ${eqData[i].geometry.coordinates[2]}</h3>
            `
        ).addTo(map);
    }


    // Setup the legend
    // Taken from https://leafletjs.com/examples/choropleth/ with some changes
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {

        let div = L.DomUtil.create('div', 'info legend'),
        grades = [-10, 10, 30, 50, 70, 90]

        div.innerHTML = "<h2>Depth</h2>"
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + depthColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(map);

})