
// Initialize the map with Simple CRS (Coordinate Reference System)
var map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 1
});

// Define bounds of the map in pixels
var bounds = [[0,0], [2071.95, 3029.278]];
// Add an image overlay to serve as the map layer
L.imageOverlay('Middle Earth.jpg', bounds).addTo(map);

// Fit the map to the defined bounds
map.fitBounds(bounds);


// Calculate the pixels-per-mile scale based on the map width
var mapWidthInMiles = 1882.35;
var mapWidthInPixels = 1600; // Width of the image in pixels
var scale = mapWidthInPixels / mapWidthInMiles; // Scale factor


// Define waypoints representing key locations in Frodo and Sam's journey
var waypoints = [
    [1500, 775], // Hobbiton
    [1490, 987], // Bree
    [1525, 1465], // Rivendell
    [1270, 1430], // Mines of Moria
    [1195, 1570], // Lothlorian
    [820, 1797], // Sarn Gebir
    [800, 2050], // Morannon
    [635, 2020], // Minas Morgul
    [680, 2140], // Mount Doom
];

// Draw a polyline through the waypoints to show the path
L.polyline(waypoints, {color: 'red'}).addTo(map);
// Add markers at each waypoint with popups
waypoints.forEach(function(point, index) {
    L.marker(point).addTo(map).bindPopup('Waypoint ' + (index + 1));
});


// Function to convert distance in miles entered by user to pixels
function convertUserDistanceToPixels(userDistanceMiles) {
    return userDistanceMiles * scale;
}

// Function to calculate the Euclidean distance between two points
var getDistance = function(pointA, pointB) {
    var xA = pointA[0], yA = pointA[1], xB = pointB[0], yB = pointB[1];
    return Math.sqrt(Math.pow((xB - xA), 2) + Math.pow((yB - yA), 2));
};

// Function called when user submits their traveled distance
function placeMarker() {
    // Retrieve and convert the user's input distance to pixels
    var userDistanceMiles = parseFloat(document.getElementById('userDistance').value);
    var userDistancePixels = convertUserDistanceToPixels(userDistanceMiles);

    // Initialize the total distance traveled along the waypoints
    var totalDistance = 0;
    // Loop through the waypoints to find where the user's distance falls
    for (var i = 1; i < waypoints.length; i++) {
        // Calculate the distance between each pair of waypoints
        var section = getDistance(waypoints[i - 1], waypoints[i]);
        totalDistance += section;
        // Check if the accumulated distance exceeds the user's distance
        if (totalDistance >= userDistancePixels) {
            // Calculate the exact position where the user's distance falls
            var overflow = totalDistance - userDistancePixels;
            var ratio = 1 - (overflow / section);  // This should be the remaining portion of the section
            var lat = waypoints[i - 1][0] + (waypoints[i][0] - waypoints[i - 1][0]) * ratio;
            var lng = waypoints[i - 1][1] + (waypoints[i][1] - waypoints[i - 1][1]) * ratio;
            var userPoint = [lat, lng];
            // Place a marker at the user's position on the map
            L.marker(userPoint).addTo(map).bindPopup('You\'ve traveled ' + userDistanceMiles + ' miles').openPopup();
            return;
        }
        
    }
    // If the user's distance exceeds the path, place a marker at the last waypoint
    L.marker(waypoints[waypoints.length - 1]).addTo(map).bindPopup('You\'ve traveled beyond Mount Doom').openPopup();
}
