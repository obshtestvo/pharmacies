var express = require('express');
var bodyparser = require('body-parser');

var app = express();
app.use(bodyparser.json());
app.use('/', express.static(__dirname + '/public'));

var server = require('http').Server(app);
server.listen(4000, function() {
    console.log('Listening on port %d', server.address().port);
});

app.get('/medicines', function(req,res) {

});

app.get('/pharmacies', function(req,res) {

	var options = {
	  host: 'data.obshtestvo.bg',
	  port: 80,
	  //More than 2500 requests will reach the API limit for Google Geocoding
	  path: '/api/action/datastore_search?resource_id=3d38a652-adbc-442b-9760-50d30a6db6c4'
	};

	http.get(options, function(ckan_res) {
	  var body = '';
	  ckan_res.on('data', function(chunk) {
	    body += chunk;
	  });
	  ckan_res.on('end', function() {
	    res.send(JSON.parse(body).result.records);
	  });
	}).on('error', function(e) {
	  console.log("Error: " + JSON.stringify(e));
	});
	
});