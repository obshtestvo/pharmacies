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

app.get('/pharmacies', function(req,res) {

	if (req.query.medicine)
		getMedicines(req.query,function(err,result) {
			if (err)
				res.status(409).send(err);
			else if (result) //medicine is present in the list
				getPharmacies(req,res);
			else
				res.status(200).send({"results":[]});
		});
	else
		getPharmacies(req,res);

});

function getPharmacies(req,res) {

	//we need to limit the precision because the query characters are limited
	var lat = +parseFloat(req.query.lat).toFixed(4);
	var lng = +parseFloat(req.query.lng).toFixed(4);
	var limit = req.query.limit || 20;
	var radius = req.query.radius || 500; //in meters

	var resource_id = "1e8cfdf8-65cd-4bda-80e3-9ec1cf5a1c09";

	var lat_interval = +(radius / 111.1175).toFixed(4); //meters in a geo-degree
	var lng_interval = +(radius / (111.1175 * Math.cos((Math.PI / 180) * lat))).toFixed(4);
	var rect_sql = querystring.escape('SELECT "Адрес на аптека","Име на фирма",latitude,longitude ' + 
								'from "' + resource_id + '" WHERE ' + 
								'latitude BETWEEN ' + (lat-lat_interval) + ' AND ' + (lat+lat_interval) + 
								' AND longitude BETWEEN ' + (lng-lng_interval) + ' AND ' + (lng+lng_interval));


	var cos = Math.cos((Math.PI / 180) * lat);
	var sin = Math.sin((Math.PI / 180) * lat);
	var sph_sql = querystring.escape('SELECT "Адрес на аптека","Име на фирма",latitude,longitude,distance FROM '+
									'( SELECT *, ' + 
									'(6371000*acos(' + cos + 
								    '*cos(radians(latitude))' +
								    '*cos(radians(longitude)-radians('+lng+'))' +
								    '+' + sin +
								    '*sin(radians(latitude))' +
								    ')) AS distance ' +
								  	'FROM "' + resource_id + '" ' +
								  	'WHERE ' + (req.query.name ? 'LOWER("Име на фирма") LIKE \'%' + req.query.name.toLowerCase() + '%\' AND ' : '') +  
								  	'latitude BETWEEN ' + (lat-lat_interval) + ' AND ' + (lat+lat_interval) + 
									' AND longitude BETWEEN ' + (lng-lng_interval) + ' AND ' + (lng+lng_interval) + 
									' ) as d WHERE distance < ' + radius + 
									' ORDER BY distance ASC LIMIT ' + limit);

	var options = {
	  host: 'data.obshtestvo.bg',
	  port: 80,
	  path: '/api/action/datastore_search_sql?sql=' + sph_sql
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
	  		res.status(409).send(parsed.error);
	  	}	
	  });
	}).on('error', function(e) {
	  console.log("Error: " + JSON.stringify(e));
	  res.status(409).send(JSON.stringify(e));
	});
}

function getMedicines(params,callback) {
	var resource_id = "f7dbc818-dbee-4893-8052-915121523108";
	var sql = querystring.escape('SELECT _id FROM "' + resource_id +
								 '" WHERE LOWER("име") LIKE \'' + params.medicine.toLowerCase() + '\' LIMIT 1');

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
	  		callback(null,parsed.result.records.length > 0);
	  	else {
	  		console.log(parsed.error);
	  		callback(parsed.error);
	  	}	
	  });
	}).on('error', function(e) {
	  console.log("Error: " + JSON.stringify(e));
	  callback(JSON.stringify(e));
	});
}