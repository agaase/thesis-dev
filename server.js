var express = require('express');
var cors = require('cors');
var req = require('request');
var app = express();
app.use(cors());
app.set('port', 8383);

var hexGridData={};

//The public directory where all the static resources are served from
app.use(express.static('./'));

app.get("/dir/:from/:to",function(request,response){
  var directionsUrl = "https://maps.googleapis.com/maps/api/directions/json?departure_time=now&traffic_model=pessimistic&key=AIzaSyCHqZ-WXhO2VHhLsEyST7TF3XU0hFm2xRA&mode=driving";
  console.log(request.params.from+"-"+request.params.to);
  req({
    uri : directionsUrl+"&origin="+request.params.from+"&destination="+request.params.to,
    method : 'GET'
  },function(err,resp,body){
    response.send(body);
  }
  )
});

app.get("/places/:keyword",function(request,response){
  var placesUrl = "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyDF3fRoh8fxQpFFIoYtQWEvjzvCW_qh7KQ";
  console.log(request.params.keyword);
  req({
    uri : placesUrl+"&address="+request.params.keyword,
    method : 'GET'
  },function(err,resp,body){
    response.send(body);
  }
  )
});

app.get("/routes/:from/:to",function(request,response){
    // core.fetchItems(function (events) {
    //   app.render('partials/'+request.params.model+"-items",events,function(err,html){
    //     response.send(html);
    //   });  
    // },request.params.model,request.body.index);
    req({
        uri : 'http://localhost:9200/delhi/drivingTime/_search',
        body: JSON.stringify({"aggs":{"r":{"aggs":{"avg_excessTime":{"avg":{"field":"ratio"}}},"terms":{"field":"r","order":{"avg_excessTime":"desc"},"size":100000}}},"query":{"bool":{"must":[{"range":{"dist":{"gt":5000,"lte":10000}}}],"must_not":[{"term":{"time":{"value":"6:30"}}}]}},"size":0}),
        method : 'POST'
      },
      function(err,resp,body){
        var routes = JSON.parse(body).aggregations.r.buckets;
        var geojson = {
          "type" : "FeatureCollection",
          "features" : []
        }
        var ct=1;
        var total = routes.length;
        routes.forEach(function(route,i){
          if(ct/total<0.1){
            ct++;
            var tiles = route.key.split("-");
            geojson.features.push({
              "type": "Feature",
              "geometry" : {
                "type": "LineString",
                "coordinates" : [hexGridData[tiles[0]],hexGridData[tiles[1]]]
              },
              "properties" : {
                "route" : route,
                "ratio" : route.avg_excessTime.value
              }
            });
          }
        });
        response.send(JSON.stringify(geojson));
      }
    )
});
app.get("/route/:start/:end",function(request,response){
    core.fetchItems(function (events) {
      app.render('partials/'+request.params.model+"-items",events,function(err,html){
        response.send(html);
      });  
    },request.params.model,request.body.index);
});

//Starting the server
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
  req({
      uri : 'http://localhost:8383/data/hex-grid.geojson',
      method : 'GET'
    },
    function(err,resp,body){
      var data = JSON.parse(body);
      data.features.forEach(function(v,i){
        hexGridData[v.properties.tile_id] = v.properties.centroid;
      });
    }
  )
});

