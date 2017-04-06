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

		var times = [
			{"value":3,"label":"5-8"},
			{"value": 5,"label":"8-11"},
			{"value": 4.5,"label":"11-4"},
			{"value" : 5.5,"label":"4-7"},
			{"value" : 6.5,"label":"7-10"}
		];
		drawPath("TIME OF DAY",times,individualHt+margin, individualHt);

		var dist = [
			{"label":2,"value": 3},
			{"label": 5,"value":4},
			{"label": 10,"value":3.5},
			{"label" : 13,"value":4.9},
			{"label" : 16,"value":6.7},
			{"label" : 20,"value":7.1},
			{"label" : 24,"value":6.5}
		];
		drawPath("DISTANCE",dist,individualHt*2+margin*2, individualHt);
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
	var map;
	mapboxgl.accessToken = 'pk.eyJ1IjoiamFza2lyYXRyIiwiYSI6ImNpd2JmZWlkODA1YXcyb21ocXFiMmZtYWwifQ.x9y8_Vny6lJn3htQYogjlw'
	var defaultStyle = {
		'version': 8,
		'sources': {
			'osm': {
				'type': 'vector',
				'tiles': ['http://localhost:7777/v2/tiles/{z}/{x}/{y}.pbf'],
				'minzoom' : 9,
				'maxzoom' : 14
			}
		},
		'layers': [
			{
				'id': "newdelhi_india_landusagesgeojson"+parseInt(Math.random()*100000),
				'type': 'fill',
				'source': 'osm',
				'source-layer': 'newdelhi_india_landusagesgeojson',
				'paint':{
					'fill-color': '#000',
					'fill-opacity': 0
				}
			},
			{
				'id': "newdelhi_india_roadsgeojson"+parseInt(Math.random()*100000),
				'type': 'line',
				'source': 'osm',
				'source-layer': 'newdelhi_india_roadsgeojson',
				'paint':{
					'line-color': '#ccc',
					'line-opacity' : 1
				}
			},
			{
				'id': "hexgridexcesstimegeojson"+parseInt(Math.random()*100000),
				'type': 'fill',
				'source': 'osm',
				'source-layer': 'hexgridexcesstimegeojson',
				'paint':{
					'fill-color': {
						"property" : "excessTime_1",
						"type": "interval",
						"stops" : [
							[100,"#80DEEA"],
							[110,"#26C6DA"],
							[120,"#00ACC1"],
							[130,"#0097A7"],
							[150,"#006064"]
						]
					},
					'fill-opacity': 0.65
				}
			}
		]
	}

	var init = function(){
		map = new mapboxgl.Map({
			container: 'map',
			style: defaultStyle,
			hash : true
		})
	 	map.addControl(new mapboxgl.Navigation());	
	}
	return {
		init : init,
		updateStyle : function(style){
			map.setStyle(style);
		}
	}
})();

Menu.setup();
Menu.render();

Map.init();