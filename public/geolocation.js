$(function() {

    var sofia = {lat: 42.637626, lng: 23.322284}; //initialize with Sofia coordinates
    var showMap = function(center) {
        var mapOptions = { center: center, zoom: 14 };
        return new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {

                var location = {lat: position.coords.latitude, lng: position.coords.longitude};
                var map = showMap(location);

                //TODO: Fix the address configuration ASAP
                var server = 'pharmacies.obshtestvo.bg';
                //var server = 'localhost:4000';
 
                $.get('http://' + server + '/pharmacies?lat='+location.lat+'&lng='+location.lng,
                    function(data) {
                        $.each(data.results,function(idx,item) {
                            var marker = new google.maps.Marker({
                                map: map,
                                position: new google.maps.LatLng(item.latitude,item.longitude),
                                title: item["Адрес на аптека"]
                            });
                        });
                    }
                );
            },
            function() { showMap(sofia); } //error
        );
    }
    else {
        showMap(sofia);
    }

});