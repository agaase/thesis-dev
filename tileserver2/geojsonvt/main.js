var express = require('express');
var http = require('http');
var fs = require("fs");
var app = express();
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.set('port', 7777);
var geojsonvt = require("geojson-vt");

var geojson = JSON.parse(fs.readFileSync("hex-grid-excesstime.geojson").toString());

// build an initial index of tiles
var tileIndex = geojsonvt(geojson,{
	indexMaxZoom: 10,
	debug: 	1
});

// console.log(tileIndex.getTile(10,731,427).features[0].geometry)
app.get(/^\/tiles\/(\d+)\/(\d+)\/(\d+).json$/, function(req, res){
	  var z = parseInt(req.params[0]);
      var x = parseInt(req.params[1]);
      var y = parseInt(req.params[2]);

      console.log('get tile %d, %d, %d', z, x, y);
      var tile = tileIndex.getTile(z, x, y);
      // console.log({tile);

      res.set("Content-Type","application/json");
      res.send(JSON.stringify(tile));
});


http.createServer(app).listen(app.get('port'), function() {
console.log('Express server listening on port ' + app.get('port'));
});