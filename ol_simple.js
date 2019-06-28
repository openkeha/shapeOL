// all the interaction stuff is copied almost verbatim from 
// http://www.openlayers.org/dev/examples/dynamic-text-layer.html

window.onload = function () {
    

    var shpLayer = new OpenLayers.Layer.Vector({
        projection: new OpenLayers.Projection('EPSG:4326')
});
    

    
    
    // load the shapefile
    //var theUrl = 'naturalearthdata/cultural/110m-admin-0-countries';
    var theUrl = 'arrondissement/N_ARROND_BDC_058';
    getOpenLayersFeatures(theUrl, function (fs) {
        console.log(fs);
	// reproject features
	// this is ordinarily done by the format object, but since we're adding features manually we have to do it.
	var fsLen = fs.length;
	//var inProj = new OpenLayers.Projection('EPSG:4326');
	var outProj = new OpenLayers.Projection('EPSG:4326');
    proj4.defs("EPSG:2154","+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
    console.log('PROJ4JS: '+proj4('EPSG:2154'));
    var inProj = new OpenLayers.Projection('EPSG:2154');
	for (var i = 0; i < fsLen; i++) {
	    fs[i].geometry = fs[i].geometry.transform(inProj, outProj);
	}
	shpLayer.addFeatures(fs);
    });
    var osm = new OpenLayers.Layer.OSM({sphericalMercator: false});
    map = new OpenLayers.Map('map', {
        projection: new OpenLayers.Projection('EPSG:4326'),
        sphericalMercator: false,    
        layers: [osm,shpLayer],
        });
    
    //map.addLayers([shpLayer]);
    
    map.setCenter(new OpenLayers.LonLat(3.53, 47.1), 3);
    // Interaction; not needed for initial display.
    selectControl = new OpenLayers.Control.SelectFeature(shpLayer);
    map.addControl(selectControl);
    selectControl.activate();
    shpLayer.events.on({
        'featureselected': onFeatureSelect,
        'featureunselected': onFeatureUnselect
    });
}
			  

// Needed only for interaction, not for the display.
function onPopupClose(evt) {
    // 'this' is the popup.
    var feature = this.feature;
    if (feature.layer) { // The feature is not destroyed
	selectControl.unselect(feature);
    } else { // After "moveend" or "refresh" events on POIs layer all 
	//     features have been destroyed by the Strategy.BBOX
	this.destroy();
    }
}
function onFeatureSelect(evt) {
    feature = evt.feature;
    var table = '<table>';
    for (var attr in feature.attributes.values) {
	table += '<tr><td>' + attr + '</td><td>' + feature.attributes.values[attr] + '</td></tr>';
    }
    table += '</table>';
    popup = new OpenLayers.Popup.FramedCloud("featurePopup",
					     feature.geometry.getBounds().getCenterLonLat(),
					     new OpenLayers.Size(100,100), table, null, true, onPopupClose);
    feature.popup = popup;
    popup.feature = feature;
    map.addPopup(popup, true);
}
function onFeatureUnselect(evt) {
    feature = evt.feature;
    if (feature.popup) {
	popup.feature = null;
	map.removePopup(feature.popup);
	feature.popup.destroy();
	feature.popup = null;
    }
}