// var sqlite3 = require('sqlite3').verbose();
// var db = new sqlite3.Database('delhi.mbtiles');

// db.serialize(function() {
//     var rows = db.run("SELECT * FROM tiles",function(r){
//     	debugger;
//    		console.log("s");
//     });
// });

// db.close();

var VectorTile = require('vector-tile').VectorTile;
var Protobuf = require('pbf');

var sqlite3 = require('sqlite3').verbose();  
var file = "delhi.mbtiles";  
var db = new sqlite3.Database(file);  
db.all("SELECT * FROM tiles", function(err, rows) {  
	console.log(rows.length);
    rows.forEach(function (row) {  
  //   	var buffer.toString('utf-8')
		// var rawInfo = new Protobuf(row.tile_data.toString())
		// console.log(rawInfo);
		var base64data = new Buffer(row.tile_data, 'binary').toString('base64');
		console.log(base64data);
    })  
    });   
db.close();  