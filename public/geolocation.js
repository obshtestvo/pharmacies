$(function() {

    var location = {lat: 42.637626, lng: 23.322284}; //initialize with Sofia coordinates
    var map = null;
    var markers = [];

    var showMap = function() {
        var mapOptions = { center: location, zoom: 16 };
        map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
    }

    var fetchServerData = function(radius,limit,name,medicine) {

        var params = {
            lat: location.lat,
            lng: location.lng
        };
        
        if (radius) params.radius = radius;
        if (limit) params.limit = limit;
        if (name) params.name = name;
        if (medicine) params.medicine = medicine;

        $("#error").html("").hide();
        $.get('http://' + window.location.host + '/pharmacies', params)
            .done(function(data) {
                $.each(markers,function(idx,item){
                    item.setMap(null);
                });
                markers = [];

                $.each(data.results,function(idx,item) {
                    var marker = new google.maps.Marker({
                        map: map,
                        position: new google.maps.LatLng(item.latitude,item.longitude),
                        title: item["Адрес на аптека"] + "\n" + (item["Име на фирма"] || "")
                    });
                    markers.push(marker);
                });
            })
            .fail(function(data) {
                $("#error").html("Error contacting data portal").show();
            });
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                location = {lat: position.coords.latitude, lng: position.coords.longitude};
                showMap();
                fetchServerData();
            },
            function() { showMap(); } //error
        );
    }
    else
        showMap();

    $('#search input.search').keypress(function(e){
        if(e.which == 13)
            fetchServerData(
                $('#radius').val(),
                $('#limit').val(),
                $('#pharmaname').val(),
                $('#medname').val()
            );
    });

    $('#search input.search').on('blur',function(e){
        fetchServerData(
            $('#radius').val(),
            $('#limit').val(),
            $('#pharmaname').val(),
            $('#medname').val()
        );
    });

});