var Menu = (function(){
	var width, height,svg;
	var setup = function(){
		svg = d3.select(".menu svg")
					.attr("height","70%")
					.attr("width","100%");
		var bbox = d3.select(".menu").node().getBoundingClientRect();
		width = bbox.width;
		height = bbox.height;
	}
	
	var fetchData = function(q,callback){
		d3.request("http://localhost:9200/delhi/drivingTime/_search").send("POST", JSON.stringify(q), function(resp){
			callback(JSON.parse(resp.response).aggregations.times.buckets);	
		});
	}

	var avgDuplicates = function(data){
		var refined = {};
		data.forEach(function(item){
			if(refined[item.label]){
				refined[item.label]["value"] += item.value;
				refined[item.label]["count"] +=1;
			}else{
				refined[item.label] = {};
				refined[item.label]["value"] = item.value;
				refined[item.label]["count"] = refined[item.label]["count"] || 1;
				refined[item.label]["sortKey"] = item.sortKey;
			}
		})
		data = [];
		for(var label in refined){
			data.push({
				"label" : label,
				"value" : refined[label]["value"]/refined[label]["count"],
				"sortKey" : refined[label]["sortKey"]
			})
		}
		return data;
	}

	var fetchRatioByTimes = function(callback){
		var times = {
			"1" : "5-8",
			"4" : "8-11",
			"8" : "11-4",
			"12" : "4-7",
			"15" : "7-10"
		}
		fetchData(esQueries.timestampAgg,function(buckets){
			var data = buckets.map(function(d){
				return {
					"label" : times[new Date(d.key*1000).getUTCHours()],
					"value" :d.avg_excessTime.value,
					"sortKey" : d.key
				}
			});
			data = avgDuplicates(data);
			data = data.sort(function(a,b){
				return a.sortKey - b.sortKey;
			})
			callback(data);
		})
	}
	var fetchRatioByDistance = function(callback){
		var times = {
			"2" : "3-6",
			"4" : "8-11",
			"6" : "12-15",
			"8" : "16-19",
			"10" : "20-25"
		}
		fetchData(esQueries.distanceAgg,function(buckets){
			buckets = buckets.filter(function(d){
				if(d.key%2==0){
					return d;
				}
			})
			var data = buckets.map(function(d){
				return {
					"label" : times[d.key],
					"value" :d.avg_excessTime.value,
					"sortKey" : d.key
				}
			});
			data = avgDuplicates(data);
			data = data.sort(function(a,b){
				return a.sortKey - b.sortKey;
			})
			callback(data);
		})
	}


	var drawPath = function(heading,data, marginTop,ht){
		var lineChart = svg.append("g");
		var marginHor=width/20;
		var htLine = ht*.7;
		var htLabel = ht*.1;

		var xLinear = d3.scaleLinear().domain([0,data.length]).range([marginHor,width-marginHor]).clamp(true);
		var yLinear = d3.scaleLinear().domain([d3.min(data,function(d){return d.value}),d3.max(data,function(d){return d.value})]).range([marginTop+htLine+htLabel,marginTop+htLabel]).clamp(true);
		var line = d3.line()
					 .x(function(d,i){return xLinear(i);})
					 .y(function(d,i){return yLinear(d.value);})
					 .curve(d3.curveBasis)
		lineChart.append("path")		 
		   .attr("d",line(data))
		   .attr("class","lineChart")
		   .attr("stroke", "#888")
           .attr("stroke-width", 2)
           .attr("fill", "none");

        var xLabels = lineChart.selectAll("foreignObject")
           .data(data)
           .enter()
           .append("foreignObject")
           .attr("x",function(d,i){ return xLinear(i)-marginHor/2;})
           .attr("y",marginTop+htLine+htLabel+htLabel*.5)
        xLabels.append("xhtml:div")
        	   .append("div")
        	   .attr("class","xLabel")
        	   .attr("id",function(d){return d.label.toString().toLowerCase();})
        	   .html(function(d){ return (d.label)});

       	var head = lineChart.append("foreignObject")
			           		.attr("x",0)
			           		.attr("y",marginTop)
        head.append("xhtml:div")
        	   .append("div")
        	   .attr("class","lineHead")
        	   .html(heading);
	}

	var renderCharts = function(){
		var individualHt=((height*.8)/4);
		var margin=individualHt/7;
		var days = [
			{"value":4,"label":"Mon"},
			{"value": 5,"label":"Tue"},
			{"value": 6,"label":"Wed"},
			{"value" : 6,"label":"Thu"},
			{"value" : 4,"label":"Fri"},
			{"value" : 4,"label":"Sat"},
			{"value" : 3,"label":"Sun"}
		];
		drawPath("DAYS",days,0, individualHt);

		// var times = [
		// 	{"value":3,"label":"5-8"},
		// 	{"value": 5,"label":"8-11"},
		// 	{"value": 4.5,"label":"11-4"},
		// 	{"value" : 5.5,"label":"4-7"},
		// 	{"value" : 3.5,"label":"7-10"}
		// ];
		fetchRatioByTimes(function(times){
			drawPath("TIME OF DAY",times,individualHt+margin, individualHt);	
		});


		// var dist = [
		// 	{"label":2,"value": 3},
		// 	{"label": 5,"value":4},
		// 	{"label": 10,"value":3.5},
		// 	{"label" : 13,"value":4.9},
		// 	{"label" : 16,"value":6.7},
		// 	{"label" : 20,"value":7.1},
		// 	{"label" : 24,"value":6.5}
		// ];

		fetchRatioByDistance(function(dist){
			drawPath("DISTANCE",dist,individualHt*2+margin*2, individualHt);	
		})
		d3.select("#mon").classed("selected",true);
	}

	var renderFilters = function(){

	}

	return {
		setup :setup,
		render : function(){
			renderCharts();
			renderFilters();
		}
	}

})();

var Map = (function(){
	var map, clipLayer;
    var styles = {
      'Polygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#999',
          lineDash: [1],
          width: 1
        }),
        fill: new ol.style.Fill({
          color: 'rgba(21, 101, 192, 0)'
        })
      })
    };

    var styleFunction = function(feature) {
      var st = styles[feature.getGeometry().getType()];
      // st.setFill(new ol.style.Fill({
      //   color: "rgba(17,96,101	,"+(feature.getProperties().roadCount/300)+")"
      // }));
      return st;
    };

    var styleFunction2 = function(feature){
    	var st = styles[feature.getGeometry().getType()];
    	var tileId;
    }

    var landuseFunction = function(feature) {
     	var kind = feature.get('kind');
     	if(kind=="residential"){
     		var style = new ol.style.Style({
			    fill: new ol.style.Fill({
			      color: 'rgba(255, 183, 77,0.8)'
			    }),
			});	
     	}else if(kind=="commercial"){
     		var style = new ol.style.Style({
			    fill: new ol.style.Fill({
			      color: 'rgba(179, 136, 255,0.8)'
			    }),
			});	
     	}else{
     		var style = new ol.style.Style({
			    fill: new ol.style.Fill({
			      color: 'rgba(178, 235, 242,0.8)'
			    }),
			});
     	}
      	
		return style
    };
	var roadStyleCache = {};
	var roadColor = {
      'major_road': 'rgba(119, 119, 102, 1)',
      'minor_road': 'rgba(204, 204, 187, 1)',
      'highway': 'rgba(255, 51, 153, 1)',
      'railway': 'rgba(119, 221, 238, 1)'
    };
 
    var roadStyleFunction = function(feature) {
		var kind = feature.get('kind');
		var railway = feature.get('railway');
		var sort_key = feature.get('sort_key');
		var styleKey = kind + '/' + railway + '/' + sort_key;
		var style = roadStyleCache[styleKey];
		if (!style) {
		  var color, width;
		  color = roadColor[kind] || "rgba(0,0,0,1)";
		  width = kind == 'highway' ? 2 : 1;
		  style = new ol.style.Style({
		    stroke: new ol.style.Stroke({
		      color: color,
		      width: width,
		      opacity: 1
		    }),
		    zIndex: sort_key
		  });
		  roadStyleCache[styleKey] = style;
		}
		return style;
	};

	var addTiles = function(){
		var colorSc = chroma.scale(['#86DDEC', '#116065']);
		d3.json("http://127.0.0.1:80",function(data){
			debugger;
			var vectorSource = new ol.source.Vector({
	          format: new ol.format.GeoJSON(),
	          url : "data/hex-grid.geojson"
	        }); 
	        var vectorLayer = new ol.layer.Vector({
	          source: vectorSource,
	          style: function(feature){
	          	 var st = styles[feature.getGeometry().getType()];
	          	 var tile_id = feature.getProperties().tile_id;
	          	 var val = data[tile_id] > 149 ? (data[tile_id]-149) : 0;
	          	 if(!val){
	          	 	st.setFill(new ol.style.Fill({
				       color: "rgba(17,96,101,0)"
				    }));	
	          	 }else{
					st.setFill(new ol.style.Fill({
				       color: colorSc(val).hex()
				    }));
	          	 }
			     
			     return st;
	          }
	        });
	        map.addLayer(vectorLayer);
	        map.addLayer(clipLayer);
        })
	}

    var createClipLayer = function(layer,styleF,opacity){
    	clipLayer = new ol.layer.VectorTile({
				        source: new ol.source.VectorTile({
			              format: new ol.format.TopoJSON(),
			              tileGrid: ol.tilegrid.createXYZ({maxZoom: 19}),
			              url: 'https://tile.mapzen.com/mapzen/vector/v1/'+layer+'/{z}/{x}/{y}.topojson?api_key=odes-9thVtDE'
			            }),
			            style: styleF,
			            opacity : 1
		        	});
    	var mousePosition = null;
        d3.select(map.getViewport()).on('mousemove', function() {
            mousePosition = [event.x,event.y];
            map.render();
        }).on('mouseout', function() {
            mousePosition = null;
            map.render();
        });
        clipLayer.on('precompose', function(event) {
           var ctx = event.context;
           var pixelRatio = event.frameState.pixelRatio;
           ctx.save();
           ctx.beginPath();
           if (mousePosition) {
               // only show a circle around the mouse
               ctx.arc(mousePosition[0] * pixelRatio, mousePosition[1] * pixelRatio,
                   70 * pixelRatio, 0, 2 * Math.PI);
               ctx.lineWidth = 2 * pixelRatio;
               ctx.strokeStyle = 'rgba(255,255,255,1)';
               ctx.stroke();
           }
           ctx.clip();
        });
        // after rendering the layer, restore the canvas context
        clipLayer.on('postcompose', function(event) {
            var ctx = event.context;
            ctx.restore();
        });
    }

	var init = function(){
		map = new ol.Map({
	      layers: [
	      	new ol.layer.VectorTile({
		        source: new ol.source.VectorTile({
	              format: new ol.format.TopoJSON(),
	              tileGrid: ol.tilegrid.createXYZ({maxZoom: 19}),
	              url: 'https://tile.mapzen.com/mapzen/vector/v1/roads/{z}/{x}/{y}.topojson?api_key=odes-9thVtDE'
	            }),
	            style: roadStyleFunction,
	            opacity: 0.3
        	})
	      ],
	      target: 'map',
	      controls: ol.control.defaults({
	        attributionOptions: ({
	          collapsible: false
	        })
	      }),
	      view: new ol.View({
	        center: ol.proj.fromLonLat([77.027045,28.640524]),
	        zoom: 11
	      })
	    });
	    map.on('singleclick', function(evt) {   
	       debugger;                      
		   var feature = map.forEachFeatureAtPixel(evt.pixel,
		     function(feature, layer) {
		     // do stuff here with feature
		     return [feature, layer];                                  
		   });                                                         
		 });   
        var vectorSource = new ol.source.Vector({
          format: new ol.format.GeoJSON(),
          url : "data/hex-grid.geojson"
        });  
        var vectorLayer = new ol.layer.Vector({
          source: vectorSource,
          style: styleFunction
        });
        map.addLayer(vectorLayer);
         // createClipLayer("roads",roadStyleFunction);
        createClipLayer("landuse",landuseFunction,0.6);
        addTiles();
	}
	return {
		init : init
	}
})();

// Menu.setup();
// Menu.render();

Map.init();