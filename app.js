var express = require("express");
var app = express();

// Enable CORS - cross origin requests - so frontend can talk to backend
var cors = require('cors')
var corsOptions = {
  origin: 'localhost:8080',
  optionsSuccessStatus: 200
}
app.use(cors())

app.set("view engine", "ejs");
app.set("view engine", "jade");


/* PostgreSQL and PostGIS module and connection setup */
var pg = require("pg"); // require Postgres module
const { Client, Query } = require('pg')

// Setup connection
var username = "postgres" // sandbox username
var password = "drowssaP" // read only privileges on our table
var host = "localhost:5432"
var database = "geoImage" // database name
var conString = "postgres://"+username+":"+password+"@"+host+"/"+database; // Your Database Connection

// Set up your database query to display GeoJSON
var image_query = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, row_to_json((name, date)) As properties FROM photos As lg) As f) As fc";

/* GET Postgres JSON data */
app.get('/data', function (req, res) {
  var client = new Client(conString);
  client.connect();
  var query = client.query(new Query(image_query));
  query.on("row", function (row, result) {
      result.addRow(row);
  });
  query.on("end", function (result) {
      res.send(result.rows[0].row_to_json);
      res.end();
  });
});

/* GET the map page */
app.get('/map', function(req, res) {
    var client = new Client(conString); // Setup our Postgres Client
    client.connect(); // connect to the client
    var query = client.query(new Query(image_query)); // Run our Query
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    // Pass the result to the map page
    query.on("end", function (result) {
        var data = result.rows[0].row_to_json // Save the JSON as variable data
        res.render('map.jade', {
            title: "GeoImage Map", // Give a title to our page
            jsonData: data // Pass data to the View
        });
    });
  });

  // Root route
app.get("/", function(req, res){
    res.render("landing.ejs", {
        title: "Welcome to GeoImage!"
    });
  });

// Frontend will make a call to the API and we just send back dummy data
// This is where you would query the db and send back the results
app.get("/testData", function(req, res) {
  res.send({
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": [
            -119.091796875,
            43.004647127794435
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": [
            -110.390625,
            38.685509760012
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": [
            -101.6015625,
            45.213003555993964
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": [
            -92.197265625,
            35.38904996691167
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": [
            -84.990234375,
            42.87596410238256
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": [
            -82.6171875,
            31.353636941500987
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": [
            -105.556640625,
            32.54681317351514
          ]
        }
      }
    ]
  })
})
  
// Start server on localhost:3000
app.listen(3000, function(req, res){
  console.log("The Great GeoImageProject server has started!");
});
