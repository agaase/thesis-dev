var Slider =(function(){
  var svg, margin = {right: 10, left: 10}, slider, handle, width, x, callback;  
  var timer;

  function hue(h) {
    if(timer){
      clearTimeout(timer);
    }
    timer = setTimeout(function(){
      callback(h);
    },500)
    handle.attr("cx", x(h));
  }

  var init = function(min,max,sliderCallback){
    d3.select(".slider svg").remove();
    callback = sliderCallback;
    var bbox = d3.select(".slider").node().getBoundingClientRect();
    svg = d3.select(".slider")
        .append("svg")
        .attr("height",50)
        .attr("width",bbox.width);
    var width = +svg.attr("width") - margin.left - margin.right, height = +svg.attr("height");   

    //scale
    x = d3.scaleLinear()
      .domain([min, max-5])
      .range([0, width])
      .clamp(true);

    //Group
    slider = svg.append("g")
      .attr("class", "slider")
      .attr("transform", "translate(" + margin.left + "," + height / 2 + ")"); 

    var gradient = slider.append("defs")
      .append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "100%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#FFFFF6")
        .attr("stop-opacity", 1);
    gradient.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", "#00ACC1")
        .attr("stop-opacity", 1);

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#37474F")
        .attr("stop-opacity", 1);

    slider.append("rect")
          .attr("x",x.range()[0]-10)
          .attr("y",-5)
          .attr("width",x.range()[1]+20-x.range()[0]-10)
          .attr("height",10)
          .style("fill","url(#gradient)")

    //Track
    slider.append("line")
      .attr("class", "track")
      .attr("x1", x.range()[0])
      .attr("x2", x.range()[1])
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-inset")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-overlay")
      .call(d3.drag()
          .on("start.interrupt", function() { slider.interrupt(); })
          .on("start drag", function() { hue(x.invert(d3.event.x)); }));

    slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(x.ticks(10))
        .enter().append("text")
          .attr("x", x)
          .attr("text-anchor", "middle")
          .text(function(d) { return d; });

    handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);
  }

  // slider.transition() // Gratuitous intro!
  //     .duration(750)
  //     .tween("hue", function() {
  //       var i = d3.interpolate(0, 70);
  //       return function(t) { hue(i(t)); };
  //     });

  return {
    init : init
  }
  
})();

