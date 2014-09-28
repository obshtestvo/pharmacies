var http = require('http');
var async = require('async');
var nodegeocoder = require('node-geocoder');
var _ = require('underscore');
var fs = require('fs');

var options = {
  host: 'data.obshtestvo.bg',
  port: 80,
  //More than 2500 requests will reach the API limit for Google Geocoding
  path: '/api/action/datastore_search?resource_id=3d38a652-adbc-442b-9760-50d30a6db6c4&offset=0&limit=2500'
};

http.get(options, function(res) {
  var body = '';
  res.on('data', function(chunk) {
    body += chunk;
  });
  res.on('end', function() {
    geoCodeResults(JSON.parse(body).result.records);
  });
}).on('error', function(e) {
  console.log("Error: " + JSON.stringify(e));
});


function geoCodeResults(pharmacies) {
	var geocoder = nodegeocoder.getGeocoder('google', 'https', {apiKey: 'YOUR-API-KEY-HERE'});
	console.log("Total pharmacies count: " + pharmacies.length);
	var failures = [];
	var successes = [];
	var count = 1; //for logging purposes
	async.eachSeries(pharmacies, //use each in lieu of map because we want results even on errors
		function (item,cb) {
			setTimeout(function() {
				geocoder.geocode(item['Адрес на аптека'] + ',' + item['Адрес на аптека - град'],
					function (err, res) {
						console.log("Processed item " + (count++));
						if (err) {
							if (err == "Error: Status is ZERO_RESULTS.") {
								failures.push(item);
								cb();
							}
							else cb(err); //Stop on all errors apart from zero geocoding results
						}
						else {
							successes.push(_.extend(item,_.pick(res[0],'latitude','longitude')));
							cb();
						}
					}
				);
			}, 100); //10 requests per second is the maximum API allowance but slower than that will hang the socket
		},
		function (err) {
			if (err)
				console.log("Error geocoding: " + err);
			//else {
				//Opting to write whatever data was fetched even on errors

				console.log("Total geocoded pharmacies count: " + successes.length);
				console.log("Stored in geocoded.json");
				console.log("Total unsuccessful geocodings count: " + failures.length);
				console.log("Stored in non-geocoded.json");

				fs.writeFileSync("output/geocoded.json",JSON.stringify(successes,null,2));
				fs.writeFileSync("output/non-geocoded.json",JSON.stringify(failures,null,2));
			//}
				
		}
	);
}