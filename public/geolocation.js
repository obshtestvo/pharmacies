$(function() {

    //initialize with Sofia coordinates
    var params = {
        lat: 42.637626,
        lng: 23.322284,
        radius: "",
        limit: "",
        name: ""
    };

    var map = null;
    var markers = [];

    var showMap = function() {
        var mapOptions = {
            center: {lat: params.lat, lng: params.lng},
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
            params.lat = map.getCenter().lat();
            params.lng = map.getCenter().lng();
            fetchServerData();
        });
    }

    var fetchServerData = function() {

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
        $('#menuExplain').hide()
        $('#search').toggle();
    });

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
    }).on('focus',function(e){
        if ($(this).val() == "") {
            $("#medok").hide();
            $("#medno").hide();
        }
    })

    $('#searchButton').on('click',function(e){    
        params.name = $('#pharmaname').val();
        params.limit = $('#limit').val();
        params.radius = $('#radius').val();
        $('#pharmaname').val("");
        fetchServerData();
    });

    //INITIALIZE MAP

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                params.lat = position.coords.latitude;
                params.lng = position.coords.longitude;
                showMap();
                fetchServerData();
            },
            function() { showMap(); } //error
        );
    }
    else
        showMap();


});