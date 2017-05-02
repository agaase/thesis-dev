/**
All operation related to data.
1. Fetch
2. Massaging
3. Conversion
**/
var DataOp = (function(){
	var queries, tileData={},routes = {}, config;

	var setup = function(callback){
		var q = d3.queue();
		q.defer(function(c1){
			d3.json("js/queries.json",function(resp){
				queries = resp;
				c1();
			})
		});
		q.defer(function(c2){
			d3.json("data/hex-grid.geojson",function(resp){
				DataOp.tileData = resp.features;
				c2();
			})
		});
		q.defer(function(c3){
			d3.json("config.json",function(resp){
				DataOp.config = resp;
				c3();
			})
		});
		q.await(function() {
		  callback();
		});
	}

	var updateWithFilters = function(barName){
		var qu = JSON.parse(JSON.stringify(queries[barName]))
		var filters = Menu.getFilters();
		if(Object.keys(filters).length){
			qu["query"]["bool"]["must"] = [];
			for(var key in filters){
				if(key != barName ){
					qu["query"]["bool"]["must"].push(filters[key]);	
				}
			}
		}
		return qu;
	}

	//Request to ES with a GET query
	var fetchFromES = function(q,callback){
		d3.request('http://localhost:9200/delhi/drivingTime/_search').send("POST", JSON.stringify(q), function(resp){
			callback(JSON.parse(resp.response));	
		});	
	}
	var fetchBarData = function(barName,callback){
		var q = updateWithFilters(barName);
		fetchFromES(q,function(resp){
			callback(resp.aggregations.bars.buckets.map(function(obj){
				return {
					"key" : obj.key,
					"value" : obj.avg_excessTime.value
				}
			}));
		});
	}

	var routeGeoJson = function(hexgridData){
		if(hexgridData){
			tileData={};
			hexgridData.features.forEach(function(v,i){
				tileData[v.properties.tile_id] = v.properties.centroid;
			});
		}
		var geojson = {
			"type" : "FeatureCollection",
			"features" : []
		}
		var ct=0;
		for(var route in routes){
			var tiles = route.split("-");
			geojson.features.push({
				"type": "Feature",
				"_id" : (++ct),
				"geometry" : {
					"type": "LineString",
					"coordinates" : [tileData[tiles[0]],tileData[tiles[1]]]
				},
				"properties" : {
					"route" : route
				}
			});
		}
		return geojson;
	}

	var fetchRoutes = function(callback){
		var q = updateWithFilters(JSON.parse(JSON.stringify(queries["routes"])));
		routes = {};
		fetchFromES(q,function(resp){
			resp.aggregations.r.buckets.forEach(function(v,i){
				routes[v.key] = v.avg_excessTime.value;
			});
			var geojson;
			if(!tileData){
				geojson=d3.json("data/hex-grid.geojson",function(hexgridData){
					callback(routes,routeGeoJson(hexgridData));
				});
			}else{
				callback(routes,routeGeoJson());
			}
		})
	}

	var fetchTilesAvg = function(callback){
		var q = updateWithFilters("tilesAvg");
		fetchFromES(q,function(resp){
			var tiles = {};
			resp.aggregations.tiles.buckets.forEach(function(v,i){
				tiles[v.key] = v.avg_excessTime.value;
			})
			callback(tiles);
		})
	}

	return {
		setup : setup,
		fetchTilesAvg : fetchTilesAvg,
		fetchBarData : fetchBarData,
		fetchRoutes : fetchRoutes,
		config : config,
		tileData : tileData
	}

})();