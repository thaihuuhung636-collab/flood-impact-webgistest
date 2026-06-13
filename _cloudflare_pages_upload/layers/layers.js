var wms_layers = [];

var lyr_KB05_DEM_VTLVN_0 = new ol.layer.Image({
        opacity: 1,
        
    title: 'KB05_DEM_VTLVN<br />\
    <img src="styles/legend/KB05_DEM_VTLVN_0_0.png" /> <= 0.5<br />\
    <img src="styles/legend/KB05_DEM_VTLVN_0_1.png" /> 0.5 - 1.0<br />\
    <img src="styles/legend/KB05_DEM_VTLVN_0_2.png" /> 1.0 - 2.0<br />\
    <img src="styles/legend/KB05_DEM_VTLVN_0_3.png" /> 2.0 - 5.0<br />\
    <img src="styles/legend/KB05_DEM_VTLVN_0_4.png" /> 5.0 - 7.0<br />\
    <img src="styles/legend/KB05_DEM_VTLVN_0_5.png" /> 7.0 - 10.0<br />\
    <img src="styles/legend/KB05_DEM_VTLVN_0_6.png" /> > 10.0<br />' ,
        
        
        source: new ol.source.ImageStatic({
            url: "./layers/KB05_DEM_VTLVN_0.png",
            attributions: ' ',
            projection: 'EPSG:3857',
            alwaysInRange: true,
            imageExtent: [11945609.673383, 1844385.573742, 12003398.853157, 1885606.501322]
        })
    });
var format_Ranhgiixphng_1 = new ol.format.GeoJSON();
var features_Ranhgiixphng_1 = format_Ranhgiixphng_1.readFeatures(json_Ranhgiixphng_1, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Ranhgiixphng_1 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Ranhgiixphng_1.addFeatures(features_Ranhgiixphng_1);
var lyr_Ranhgiixphng_1 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_Ranhgiixphng_1, 
                style: style_Ranhgiixphng_1,
                popuplayertitle: 'Ranh giới xã/phường',
                interactive: true,
                title: '<img src="styles/legend/Ranhgiixphng_1.png" /> Ranh giới xã/phường'
            });
var format_Mtctkhost_2 = new ol.format.GeoJSON();
var features_Mtctkhost_2 = format_Mtctkhost_2.readFeatures(json_Mtctkhost_2, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Mtctkhost_2 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Mtctkhost_2.addFeatures(features_Mtctkhost_2);
var lyr_Mtctkhost_2 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_Mtctkhost_2, 
                style: style_Mtctkhost_2,
                popuplayertitle: 'Mặt cắt khảo sát',
                interactive: true,
                title: '<img src="styles/legend/Mtctkhost_2.png" /> Mặt cắt khảo sát'
            });
var group_Nn = new ol.layer.Group({
                                layers: [lyr_Ranhgiixphng_1,lyr_Mtctkhost_2,],
                                fold: 'open',
                                title: 'Nền'});
var group_KB05 = new ol.layer.Group({
                                layers: [lyr_KB05_DEM_VTLVN_0,],
                                fold: 'close',
                                title: 'KB05'});

lyr_KB05_DEM_VTLVN_0.setVisible(true);lyr_Ranhgiixphng_1.setVisible(true);lyr_Mtctkhost_2.setVisible(true);
var layersList = [group_KB05,group_Nn];
lyr_Ranhgiixphng_1.set('fieldAliases', {'ma_xa': 'ma_xa', 'ten_xa': 'ten_xa', 'sap_nhap': 'sap_nhap', 'tru_so': 'tru_so', 'loai': 'loai', 'cap': 'cap', 'stt': 'stt', 'dtich_km2': 'dtich_km2', 'dan_so': 'dan_so', 'matdo_km2': 'matdo_km2', 'ma_tinh': 'ma_tinh', 'ten_tinh': 'ten_tinh', });
lyr_Mtctkhost_2.set('fieldAliases', {'Id': 'Id', 'ChieuDai': 'ChieuDai', 'Ten': 'Ten', });
lyr_Ranhgiixphng_1.set('fieldImages', {'ma_xa': 'TextEdit', 'ten_xa': 'TextEdit', 'sap_nhap': 'TextEdit', 'tru_so': 'TextEdit', 'loai': 'TextEdit', 'cap': 'Range', 'stt': 'Range', 'dtich_km2': 'TextEdit', 'dan_so': 'Range', 'matdo_km2': 'TextEdit', 'ma_tinh': 'TextEdit', 'ten_tinh': 'TextEdit', });
lyr_Mtctkhost_2.set('fieldImages', {'Id': 'Range', 'ChieuDai': 'TextEdit', 'Ten': 'TextEdit', });
lyr_Ranhgiixphng_1.set('fieldLabels', {'ma_xa': 'no label', 'ten_xa': 'header label - visible with data', 'sap_nhap': 'no label', 'tru_so': 'no label', 'loai': 'no label', 'cap': 'no label', 'stt': 'no label', 'dtich_km2': 'no label', 'dan_so': 'no label', 'matdo_km2': 'no label', 'ma_tinh': 'no label', 'ten_tinh': 'no label', });
lyr_Mtctkhost_2.set('fieldLabels', {'Id': 'no label', 'ChieuDai': 'no label', 'Ten': 'header label - always visible', });
lyr_Mtctkhost_2.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});