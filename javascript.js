alert("This web page is used to collect the delivery grocery position and information. The grocery will be collected as point vector data and information will be collected by the form and saved in attribute data. The drawing toolbox is on the left side. Clicking the marker button to add new data. Each grocery data need to finish the popup form and click submit button. The pen button is for edit and the garbage can is for delete. ")

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
var sqlQuery = "SELECT the_geom, name, address, phone, day, product, deliveryservice, comment FROM lab_3c_chian";
function addPopup(feature, layer) {
    layer.bindPopup(
        "<b>Name: </b>" + feature.properties.name + "<b><br>Adress: </b>" +
        feature.properties.address + "<b><br>Phone: </b>" + feature.properties.phone + "<b><br>Open Day: </b>" + feature.properties.day + "<b><br>Delivery Service: </b>" + feature.properties.deliveryservice + "<b><br>Products: </b>" + feature.properties.product + "<b><br>Comment: </b>" + feature.properties.comment
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
    		'<b>Grocery Open Day:</b><br><select id="day" name="day"><option value="">--Please Select--</option><option value="Weekday">Weekday</option><option value="Mon - Sat">Mon - Sat</option><option value="Everyday">Everyday</option></select><br><br>'+
        '<b>Delivery Service:</b><br><select id="deliveryservice" name="day"><option value="">--Please Select--</option><option value="yes">Yes</option><option value="No">No</option></select><br><br>'+
    		'<b>Products:</b><br><input type="checkbox" id="beverages" name="product"><label for="beverages">Beverages</label><br><input type="checkbox" id="cannedgoods" name="product" ><label for="cannedgoods">Canned Goods</label><br><input type="checkbox" id="dairy" name="product"><label for="dairy"> Dairy</label><br><input type="checkbox" id="frozenfoods" name="product"><label for="frozenfoods"> Frozen Foods</label><br><input type="checkbox" id="meat" name="product"><label for="meat"> Meat</label><br><input type="checkbox" id="produce" name="product"><label for="produce"> Produce</label><br><input type="checkbox" id="cleaners" name="product"><label for="cleaners"> Cleaners</label><br><input type="checkbox" id="personalcare" name="product8"><label for="personalcare"> Personal Care</label><br><input type="checkbox" id="others" name="product9"><label for="others"> Others</label><input type="text" id="otherstext"><br><br>'+
    		'<b>Comment:</b><br><textarea id="comment" name="comment" rows="3" cols="20"></textarea><br><br>'+
    		'<input type="button" value="Submit" id="submit">'+
        '  <input type="reset" value="Reset">'+
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
        var enteredDeliveryService =
        document.getElementById("deliveryservice").value;
        var enteredProduct = '';
        if(beverages.checked == true)
          {enteredProduct = enteredProduct + 'beverages, '}
        else
          {enteredProduct = enteredProduct};
        if(cannedgoods.checked == true)
          {var enteredProduct = enteredProduct + 'canned goods, '}
        else
          {var enteredProduct = enteredProduct};
        if(dairy.checked == true)
          {var enteredProduct = enteredProduct + 'dairy, '}
        else
          {var enteredProduct = enteredProduct};
        if(frozenfoods.checked == true)
          {var enteredProduct = enteredProduct + 'frozen foods, '}
        else
          {var enteredProduct = enteredProduct};
        if(meat.checked == true)
          {var enteredProduct = enteredProduct + 'meat, '}
        else
          {var enteredProduct = enteredProduct};
        if(produce.checked == true)
          {var enteredProduct = enteredProduct + 'produce, '}
        else
          {var enteredProduct = enteredProduct};
        if(cleaners.checked == true)
          {var enteredProduct = enteredProduct + 'cleaners, '}
        else
          {var enteredProduct = enteredProduct};
        if(personalcare.checked == true)
          {var enteredProduct = enteredProduct + 'personal care, '}
        else
          {var enteredProduct = enteredProduct};
        if(others.checked == true)
          {var enteredProduct = enteredProduct + document.getElementById("otherstext").value}
        else
          {var enteredProduct = enteredProduct};
        var enteredComment =
        document.getElementById("comment").value;


        // For each drawn layer
        drawnItems.eachLayer(function(layer) {

			// Create SQL expression to insert layer
            var drawing = JSON.stringify(layer.toGeoJSON().geometry);
            var sql =
                "INSERT INTO lab_3c_chian (the_geom, name, address, phone, day, product, comment, deliveryservice) " +
                "VALUES (ST_SetSRID(ST_GeomFromGeoJSON('" +
                drawing + "'), 4326), '" +
                enteredName + "', '" +
                enteredAddress + "', '" +
                enteredPhone + "', '" +
                enteredDay + "', '" +
                enteredProduct + "', '" +
                enteredComment + "', '" +
                enteredDeliveryService + "')";
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
        newData.properties.product = enteredProduct;
        newData.properties.comment = enteredComment;
        newData.properties.deliveryservice = enteredDeliveryService
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
