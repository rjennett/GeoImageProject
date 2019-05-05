var express = require("express");
var app = express();


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
  
  // Start server on localhost:3000
  app.listen(3000, function(req, res){
    console.log("The Great GeoImageProject server has started!");
  });