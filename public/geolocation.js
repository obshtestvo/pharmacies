$(function() {

	// var data = {
	//     resource_id: '3d38a652-adbc-442b-9760-50d30a6db6c4', // the resource id
	//     limit: 15 // get 15 results
	//   };
	//   $.ajax({
	//     url: 'http://data.obshtestvo.bg/api/action/datastore_search',
	//     data: data,
	//     dataType: 'jsonp',
	//     success: function(data) {
	//       alert('Total results found: ' + data.result.total)
	//     },
	//     error: function(data,text) {
	//     	alert(JSON.stringify(data));
	//     	alert(text);
	//     }
	//   });

    $.get('http://localhost:4000/pharmacies',function(data) {
        debugger
        alert(data);
    });

	var mapOptions = {
      center: { lat: 42.637626, lng: 23.322284},
      zoom: 12
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);

	

	// var addresses = $.map(dataset, function(item) {
	// 	return item["Адрес на аптека"];
	// });


	// var marker = new google.maps.Marker({
 //        map: map,
 //        position: results[0].geometry.location,
 //        title: address
 //    });

});