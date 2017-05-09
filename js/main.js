var App = (function(){
	var stmt, selectedBtn;
	var storyline = [
		"Nearly three-fourth areas of Delhi are taking atleast 20% longer to commute on average",
		"More than one-third of them are taking atleast 50% longer",
		"Between 4 to 7pm half of Delhi is taking atleast 50% longer",
		"For distances less than 5kms only 10% of Delhi takes 50% longer",
	]

	var stmtUpdate = function(val,show){
		stmt.transition()
			.duration(500)
			.style("opacity",show ? 1 : 0);

		setTimeout(function(){
			stmt.html(val);
		},700)
	}

	var handleBtnClick = function(ct,dontRender){
		if(!selectedBtn || selectedBtn!=ct){
			selectedBtn=ct;
			var nodes = d3.selectAll(".storyline .btn").nodes();
			if(ct==0){
				if(!dontRender){
					Menu.resetFilters();
					Menu.render(function(){
						stmtUpdate(storyline[ct],true);		
					});
				}else{
					stmtUpdate(storyline[ct],true);
				}
			}else if(ct==1){
				Menu.resetFilters();
				Menu.render(function(){
					Slider.changePosition(50);
					stmtUpdate(storyline[ct],true);	
				});
			}
			else if(ct==2){
				Menu.resetFilters();
				var filter = {
				  "term": {
				    "time": {
				    	"value" : "17:30"
				    }
				  }
				};
				Menu.updateFilters("time",filter);
				Menu.render(function(){
					stmtUpdate(storyline[ct],true);	
				});
			}
			else if(ct==3){
				Menu.resetFilters();
				var filter = {
				  "range": {
				    "dist": {
				    	"lte" : 5000
				    }
				  }
				};
				Menu.updateFilters("dist",filter);
				Menu.render(function(){
					Slider.changePosition(50);
					stmtUpdate(storyline[ct],true);	
				});
			}
			d3.selectAll(".storyline .btn").classed("active",false);
			d3.select(nodes[ct]).classed("active",true);
		}
	}

	return {
		init : function(){
			DataOp.setup(function(){
				Map.init();
				d3.select(".explore").on("click",function(){
					d3.select(".menu").classed("inactive",false).classed("explore",true);
					d3.select(".bars").classed("inactive",false).classed("explore",true);
					d3.select(".lenses").classed("inactive",false).classed("explore",true);
					Menu.init();
					stmt = d3.select(".stmt4");
					stmtUpdate("",false);
					handleBtnClick(0,true);
					d3.selectAll(".storyline .btn").on("click",function(){
						handleBtnClick(parseInt(d3.select(this).html())-1);
					})
				})
				d3.select(".interact").on("click",function(){
					d3.select(".menu").classed("inactive",false).classed("explore",false);
					d3.select(".bars").classed("inactive",false);
					d3.select(".lenses").classed("inactive",false);
					Menu.init();
				})
			})
			
		}
	}
})()

App.init();


// 1. Nearly three-fourth of Delhi are taking atleast 20% longer to commute on average. 
// 2. More than one-third is taking atleast 50% longer. 
// 3. This means, a person travelling from these areas will take 30 mins extra for every 1 hour of travel on any given day. 