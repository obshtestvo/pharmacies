var express = require('express');
var bodyparser = require('body-parser');
var http = require('http');
var querystring = require('querystring');

var app = express();
app.use(bodyparser.json());
app.use('/', express.static(__dirname + '/public'));

var server = http.Server(app);
server.listen(4000, function() {
    console.log('Listening on port %d', server.address().port);
});

app.get('/medicines', function(req,res) {

});

app.get('/pharmacies', function(req,res) {

	//we need to limit the precision because the query characters are limited
	var lat = +parseFloat(req.query.lat).toFixed(4);
	var lng = +parseFloat(req.query.lng).toFixed(4);
	var interval = 0.002;
	var sql = querystring.escape('SELECT "Адрес на аптека",latitude,longitude ' + 
								'from "1e8cfdf8-65cd-4bda-80e3-9ec1cf5a1c09" WHERE ' + 
								'latitude BETWEEN ' + (lat-interval) + ' AND ' + (lat+interval) + 
								' AND longitude BETWEEN ' + (lng-interval) + ' AND ' + (lng+interval));

	var options = {
	  host: 'data.obshtestvo.bg',
	  port: 80,
	  path: '/api/action/datastore_search_sql?sql=' + sql
	};

	http.get(options, function(ckan_res) {
	  var body = '';
	  ckan_res.on('data', function(chunk) {
	    body += chunk;
	  });
	  ckan_res.on('end', function() {
	  	var parsed = JSON.parse(body);
	  	if (parsed.success)
	  		res.status(200).send({"results":parsed.result.records});
	  	else {
	  		console.log(parsed.error);
	  		res.status(409).send({"error":parsed.error});
	  	}	
	  });
	}).on('error', function(e) {
	  console.log("Error: " + JSON.stringify(e));
	  res.status(409).send({"error":e});
	});

});