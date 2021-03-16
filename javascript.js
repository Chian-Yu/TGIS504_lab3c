alert("This web page is used to collect polygon and point vector and attribute data. The drawing toolbox is on the left side. The pentagon button is used to draw polygon. The marker button is used to draw points. The pen button is for edit and the garbage can is for delete. After finishing your feature, please enter the feature's title and its description.")

var map = L.map('map').setView([47.24, -122.43], 13);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2hpYW55dSIsImEiOiJja2hjcG5ubXUwMXZ4Mnp0OW93enk5Yjh2In0.PgRvkVtqOFh9ew6lp-BFuw', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
}).addTo(map);

var drawnItems = L.featureGroup().addTo(map);

var cartoData = L.layerGroup().addTo(map);
var url = "https://chian-yu.carto.com/api/v2/sql";
var urlGeoJSON = url + "?format=GeoJSON&q=";
var sqlQuery = "SELECT the_geom, name, address, phone, day FROM lab_3c_chian";
function addPopup(feature, layer) {
    layer.bindPopup(
        "<b>Name: " + feature.properties.name + "</b><br>Adress: " +
        feature.properties.address + "</b><br>Phone: " + feature.properties.phone + "</b><br>Off Time:" + feature.properties.day
    ).openPopup();
}

fetch(urlGeoJSON + sqlQuery)
    .then(function(response) {
    return response.json();
    })
    .then(function(data) {
        L.geoJSON(data, {onEachFeature: addPopup}).addTo(cartoData);
    });

new L.Control.Draw({
    draw : {
        polygon : false,
        polyline : false,
        rectangle : false,     // Rectangles disabled
        circle : false,        // Circles disabled
        circlemarker : false,  // Circle markers disabled
        marker: true
    },
    edit : {
        featureGroup: drawnItems
    }
}).addTo(map);

function createFormPopup() {
    var popupContent =
        '<form>' +
        '<b>Grocery Name:</b><br><input type="text" id="name" autofocus><br><br>'+
    		'<b>Grocery Address:</b><br><textarea id="address" name="address" rows="2" cols="20"></textarea><br><br>'+
    		'<b>Grocery Phone:</b><br><input type="text" id="phone"><br><br>'+
    		'<b>Grocery Open Day:</b><br><input list="day"> <datalist id="day"><option value="Weekday"><option value="Mon - Sat"><option value="Everyday"></datalist><br><br>'+
    		'<b>Products:</b><br><input type="checkbox" id="beverages" name="beverages" value="Yes"><label for="beverages">Beverages</label><br><input type="checkbox" id="cannedgoods" name="cannedgoods" ><label for="cannedgoods">Canned Goods</label><br><br>'+
    			// '<input type="checkbox" id="product3" name="product3" value="dairy"><label for="product3"> Dairy</label><br>'+
    			// '<input type="checkbox" id="product4" name="product4" value="frozenFoods"><label for="product4"> Frozen Foods</label><br>'+
    			// '<input type="checkbox" id="product5" name="product5" value="meat"><label for="product5"> Meat</label><br>'+
          // '<input type="checkbox" id="product6" name="product6" value="produce"><label for="product6"> Produce</label><br>'+
    			// '<input type="checkbox" id="product7" name="product7" value="cleaners"><label for="product7"> Cleaners</label><br>'+
    			// '<input type="checkbox" id="product8" name="product8" value="personalCare"><label for="product8"> Personal Care</label><br>'+
    			// '<input type="checkbox" id="product9" name="product9" value="others"><label for="product9"> Others</label><br><br>'+
    			'<b>Comment:</b><br><textarea id="comment" name="comment" rows="3" cols="20"></textarea><br><br>'+
    		  '<input type="button" value="Submit" id="submit">'+
          '<input type="reset" value="Reset">'
    		'</fieldset>'+
        '</form>'
    drawnItems.bindPopup(popupContent).openPopup();
}

map.addEventListener("draw:created", function(e) {
    e.layer.addTo(drawnItems);
    createFormPopup();
});

function setData(e) {

    if(e.target && e.target.id == "submit") {

        // Get user name and description
        var enteredName = document.getElementById("name").value;
        var enteredAddress = document.getElementById("address").value;
        var enteredPhone = document.getElementById("phone").value;
        var enteredDay =
        document.getElementById("day").value;
        var enteredBeverages =
        document.getElementById("beverages").value;
        var enteredCannedGoods =
        document.getElementById("cannedgoods").value;
        var enteredComment =
        document.getElementById("comment").value;


        // For each drawn layer
        drawnItems.eachLayer(function(layer) {

			// Create SQL expression to insert layer
            var drawing = JSON.stringify(layer.toGeoJSON().geometry);
            var sql =
                "INSERT INTO lab_3c_chian (the_geom, name, address, phone, day, beverages, cannedgoods, comment) " +
                "VALUES (ST_SetSRID(ST_GeomFromGeoJSON('" +
                drawing + "'), 4326), '" +
                enteredName + "', '" +
                enteredAddress + "', '" +
                enteredPhone + "', '" +
                enteredDay + "', '" +
                enteredBeverages + "', '" +
                enteredCannedGoods + "', '" +
                enteredComment + "')";
            console.log(sql);

            // Send the data
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: "q=" + encodeURI(sql)
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                console.log("Data saved:", data);
            })
            .catch(function(error) {
                console.log("Problem saving the data:", error);
            });

        // Transfer submitted drawing to the CARTO layer
        //so it persists on the map without you having to refresh the page
        var newData = layer.toGeoJSON();
        newData.properties.name = enteredName;
        newData.properties.address = enteredAddress;
        newData.properties.phone = enteredPhone;
        newData.properties.day = enteredDay;
        newData.properties.comment = enteredComment;
        L.geoJSON(newData, {onEachFeature: addPopup}).addTo(cartoData);

    });

        // Clear drawn items layer
        drawnItems.closePopup();
        drawnItems.clearLayers();

    }
}

document.addEventListener("click", setData);

map.addEventListener("draw:editstart", function(e) {
    drawnItems.closePopup();
});
map.addEventListener("draw:deletestart", function(e) {
    drawnItems.closePopup();
});
map.addEventListener("draw:editstop", function(e) {
    drawnItems.openPopup();
});
map.addEventListener("draw:deletestop", function(e) {
    if(drawnItems.getLayers().length > 0) {
        drawnItems.openPopup();
    }
});
