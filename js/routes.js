/**
All operation related to data.
1. Fetch
2. Massaging
3. Conversion
**/
var Routes = (function(){
	var queries, tileData={},routes = {}, config, tileCoord={}, 
		days = ["Sun","Mon","Tue","Wed","Thur","Fri","Sat"];

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
				tileData = resp.features;
				tileData.forEach(function(v,i){
					tileCoord[v.properties.tile_id] = v.properties.centroid;
				})
				c2();
			})
		});
		q.defer(function(c3){
			d3.json("config.json",function(resp){
				config = resp;
				c3();
			})
		});

		q.await(function() {
		  callback();
		});
	}

	//Request to ES with a GET query
	var fetchFromES = function(q,callback){
		d3.request(config.localUrl + ":"+config.esPort+'/delhi/drivingTime/_search').send("POST", JSON.stringify(q), function(resp){
			callback(JSON.parse(resp.response));	
		});	
	}

	var fetchRoutes = function(callback){
		var q = JSON.parse(JSON.stringify(queries["top_routes"]));
		routes = [];
		fetchFromES(q,function(resp){
			resp.hits.hits.forEach(function(v,i){
				routes.push({
					"from" : tileCoord[v._source.tEn],
					"to" : tileCoord[v._source.tFr],
					"ratio" : v._source.ratio,
					"time" : v._source.time,
					"day" : v._source.day,
					"dist" : Math.ceil(v._source.dist/1000),
					"url" : "https://www.google.com/maps/dir/?api=1&origin="+tileCoord[v._source.tFr].reverse()+"&destination="+tileCoord[v._source.tEn].reverse()
				})
			});
			// var geojson;
			// if(!tileData){
			// 	geojson=d3.json("data/hex-grid.geojson",function(hexgridData){
			// 		callback(routes,routeGeoJson(hexgridData));
			// 	});
			// }else{
			// 	callback(routes,routeGeoJson());
			// }
			callback(routes);
		})
	}

	return {
		init : function(){
			setup(function(){
				fetchRoutes(function(routes){
					routes.forEach(function(v,i){
						d3.select(".routes")
						  .append("tr")
						  .html("<td>"+v.dist+"</td><td>"+days[v.day]+", "+v.time+"</td><td><a href='"+v.url+"' target='_blank'>"+parseInt(v.ratio-100)+"%</a></td>");
					})
				})
			});
		}
	}
})();

Routes.init();