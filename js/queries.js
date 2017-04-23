var esQueries = {
	"timestampAgg" : {
	  "size": 0, 
	  "query": {
	    "filtered": {
	      "query": {
	        "match_all": {}
	      }
	    }
	  },
	  "aggs": {
	    "times": {
	      "terms": {
	        "field": "timestamp",
	        "size": 10
	      },
	      "aggs" : {
	        "avg_excessTime" : { "avg" : { "field": "ratio"}}
	      }
	    }
	  }
	},
	"distanceAgg" : {
	  "size": 0, 
	  "query": {
	    "filtered": {
	      "query": {
	        "match_all": {}
	      }
	    }
	  },
	  "aggs": {
	    "times": {
	      "terms": {
	        "field": "neDist",
	        "size": 10
	      },
	      "aggs" : {
	        "avg_excessTime" : { "avg" : { "field": "ratio"}}
	      }
	    }
	  }
	}
}