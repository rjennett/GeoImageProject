// 'npm run dev' to start local webserver for both front and backend
// frontend will be hosted at localhost:8080
// backend still at localhost:3000
// you will have to run 'npm install' to get new dependencies if you haven't already

document.addEventListener("DOMContentLoaded", function(event) { 
  var API_Url = 'http://localhost:3000';

  // Create variable to hold map element, give initial settings to map
  var map = L.map('map',{ center: [39.8283, -98.5795], zoom: 4});
  
  // Add OpenStreetMap tile layer to map element
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
  
  // New way to get data using client-side rendering
  // fetch makes a call to a url and returns a response as a promise
  // .then indicates the next step in a promise chain which will be passed data from the step before
  fetch(API_Url + '/testData')
	  .then(function(response) {
	    return response.json();
	  })
	  .then(function(json) {
	  	// open the browser console to see the data printed out
	    console.log("here's the test data from the backend", json);

	    // Add JSON to map
		  L.geoJson(json,{
		    onEachFeature: function (feature, layer) {
		      layer.bindPopup(feature.properties.f2);
		    }
		  }).addTo(map);
	  });

});
