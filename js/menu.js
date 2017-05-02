 var Menu = (function(){
	var defaultColor = "#cccccc", filters={};
	var renderBarData = function(barName,domain,filterFunction){
		if(!d3.select("."+barName+".bar svg").empty() && d3.select("."+barName+".bar svg").classed("selected")){
			// return;
		}
		var bbox = d3.select("."+barName+".bar").node().getBoundingClientRect();
		var width = bbox.width, height = bbox.height, margin=40;
		// d3.select("."+barName+".bar svg").remove();
		var scale = d3.scaleLinear()
							   .domain(domain)
							   .range([0,width-margin]);

		DataOp.fetchBarData(barName,function(data){
			if(d3.select("."+barName+".bar svg").empty()){
				var svgBar = d3.select("."+barName+".bar")
							  .append("svg")
							  .attr("height",data.length*25)
							  .attr("width",width);

				svgBar.selectAll("g")
					.data(data)
					.enter()
					.append("g")
					.each(function(d,i){
						  d3.select(this)
						 	.attr("bar-key",d.key)
						  d3.select(this).append("rect")
									  .attr("x",margin)
									  .attr("y",i*25)
									  .attr("height",15)
									  .attr("width",0)
									  .transition()
									  .duration(500)
									  .attr("width",scale(d.value))
						  d3.select(this).append("text")
									  .attr("x",margin-2)
									  .attr("y",i*25 + 15/2)
									  .attr("alignment-baseline","middle")
									  .attr("text-anchor","end")
									  .text(DataOp.config["keyMap"][barName][d.key])
					})
					.on("click",function(){
						  if(d3.select(this).classed("barSelected")){
						  	d3.select(this).classed("barSelected",false);
						  	d3.select(this.parentNode).classed("selected",false);
						  	delete filters[barName];
						  	Menu.render();
						  }else{
							  d3.select("."+barName+".bar svg").classed("selected",true);
							  d3.selectAll("."+barName+".bar svg g").classed("barSelected",false);
							  d3.select(this).classed("barSelected",true);
							  var keyVal = d3.select(this).attr("bar-key").split("-");
						      filters[barName] = filterFunction(keyVal);
						      updateStmt2(barName,DataOp.config["keyMap"][barName][keyVal.join("-")]);
						      Menu.render();
					      }
				})
			}else{
				svgBar = d3.select("."+barName+".bar svg");
				svgBar.selectAll("rect")
					  .data(data)
					  .each(function(d,i){
					  	console.log(data[i].value);
					  	d3.select(this)
					  	  .transition()
					  	  .duration(500)
					  	  .attr("width",scale(d.value))
					  })
			}
		});
	}
	var updateStmt1 = function(area, time, day, dist){
		d3.select(".statement .areaVal").html(Math.ceil(area*100)+"%");
		d3.select(".statement .timeVal").html(parseInt(time)+"% longer");
	}
	var updateStmt2 = function(type,val){
		var prefix,suffix;
		if(type=="dist"){
			prefix = "a distance of ";
			suffix = " kms"
		}
		else if(type=="time"){
			prefix = " between ";
			suffix = "pm"
		}
		else if(type=="day"){
			prefix = " on ";
			suffix = ","
		}

		d3.select(".statement ."+type).html(prefix+val+suffix);
	}
	return {
		getFilters : function(){
			return filters;
		},
		updateFilters : function(key,filter){
			filters[key] = filter;
		},
		updateStmt1 : updateStmt1,
		init : function(){
			DataOp.setup(function(){
				Map.init();
				this.render();
			}.bind(this));
		},
		render : function(){
			Map.renderTileLayer();
			// Map.renderRouteLayer();
			renderBarData("day",[100,175],function(keyVal){
				var filter = {
				  "term": {
				    "day": {
				    	"value" : parseInt(keyVal[0])
				    }
				  }
				};
				return filter;
			})
			renderBarData("time",[100,175],function(keyVal){
				var filter = {
				  "term": {
				    "time": {
				    	"value" : keyVal[0]
				    }
				  }
				};
				return filter;
			})
			renderBarData("dist",[100,175],function(keyVal){
				var filter = {
				  "range": {
				    "dist": {
				    }
				  }
				};
				if(keyVal[0] != "*"){
					filter["range"]["dist"]["gt"]=parseFloat(keyVal[0]);
				}
				if(keyVal[1] != "*"){
					filter["range"]["dist"]["lte"]=parseFloat(keyVal[1]);
				}
				return filter;
			})
		}
	}
})();

Menu.init();