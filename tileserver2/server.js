var express = require('express');
var http = require('http');
var app = express();
var tilelive = require('@mapbox/tilelive');
require('mbtiles').registerProtocols(tilelive);

var VectorTile = require('vector-tile').VectorTile;
var zlib = require('zlib');
var Protobuf = require('pbf');
var program = require('commander');
var tileInformation = require('./tileInfo.js');

var vtpbf = require('vt-pbf')   


tilelive.load('mbtiles:./tiles/delhi2.mbtiles', function(err, source) {

    if (err) {
        throw err;
    }
    app.set('port', 7777);

    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.get(/^\/v2\/tiles\/(\d+)\/(\d+)\/(\d+).pbf$/, function(req, res){

        var z = req.params[0];
        var x = req.params[1];
        var y = req.params[2];

        console.log('get tile %d, %d, %d', z, x, y);

        source.getTile(z, x, y, function(err, tile, headers) {
            if (err) {
                res.status(404)
                res.send(err.message);
                console.log(err.message);
                
            } else {
              // console.log(tile.toString());
              // zlib.unzip(tile, function(err, tileN) {
              //   if (!err) {
              //       var rawTile = new VectorTile(new Protobuf(tileN))
              //       var f = rawTile.layers.hexgridgeojson.feature(0);
              //       var geojs = f.toGeoJson(x,y,z);
              //       // var tileName = program.z + "-" + program.x + "-" + program.y;
              //       // var tileInfo = tileInformation.printOutput(rawTile.layers, program.provider, tileName);
              //       // console.log(tileInfo);
              //       var tileA = vtpbf(rawTile);
              //       zlib.gzip(tileA,function(err,tileAZ){
              //           res.set(headers);
              //           res.send(tileAZ);
              //       })
              //   }
              // });
              res.set(headers);
              res.send(tile);
            }
        });
    });

    http.createServer(app).listen(app.get('port'), function() {
        console.log('Express server listening on port ' + app.get('port'));
    });
});