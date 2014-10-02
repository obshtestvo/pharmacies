$(function() {

    var location = {lat: 42.637626, lng: 23.322284}; //initialize with Sofia coordinates
    var map = null;
    var markers = [];
    var params = {};

    var showMap = function() {
        var mapOptions = {
            center: location,
            zoom: 16,
            zoomControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.DEFAULT,
                position: google.maps.ControlPosition.RIGHT_BOTTOM
                },
            panControl: true,
            panControlOptions: {
                position: google.maps.ControlPosition.RIGHT_BOTTOM
                },
            };
        map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
        google.maps.event.addListener(map,'dragend',function(event) {
            debugger
            location.lat = map.getCenter().lat();
            location.lng = map.getCenter().lng();
            fetchServerData();
        });
    }

    var fetchServerData = function(radius,limit,name) {

        var params = {
            lat: location.lat,
            lng: location.lng
        };

        if (radius) params.radius = radius;
        if (limit) params.limit = limit;
        if (name) params.name = name;

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

    var checkMedicine = function(medicine) {
        $("#error").html("").hide();
        $.get('http://' + window.location.host + '/medicine', {medicine:medicine})
            .done(function(data) {
                $("#medok").show();
            })
            .fail(function(data) {
                if (data.responseText && JSON.parse(data.responseText).error == "nomatch")
                    $("#medno").show();
                else
                    $("#error").html("Error contacting data portal").show();
            });
    }

    //ATTACH EVENTS

    $('#menuIcon').on('click',function(e) {
        $('#menuExplain').hide();
        $('#search').toggle();
    })

    $('#search input.search').clearSearch({clearClass:'clearButton'}); 

    $('#radius').on('input',function(e){
        $('#radiusValue').val(this.value);
    });

    $('#limit').on('input',function(e){
        $('#limitValue').val(this.value);
    });

    $('#pharmaname').keypress(function(e) {
        if (e.charCode == '13')
            $('#searchButton').click();
    });

    var medicineTimer = null;
    $('#medname').keydown(function(e) {
        $("#medok").hide();
        $("#medno").hide();
        clearTimeout(medicineTimer);
        if (e.charCode == '13') checkMedicine($('#medname').val());
        else setTimeout(function() {
            checkMedicine($('#medname').val());
        },1000);
    })

    $('#searchButton').on('click',function(e){
        fetchServerData(
            $('#radius').val(),
            $('#limit').val(),
            $('#pharmaname').val()
        );
        $('#pharmaname').val("");
    });

    //INITIALIZE MAP

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


});