window.FLOOD_QGIS2WEB_CONFIG = {
  "title": "Flood Impact WebGIS",
  "defaultAlpha": 0.7,
  "defaultBasemap": "street",
  "layers": [
    {
      "id": "KB01_Grid_Data",
      "alias": "KB01",
      "caption": "KB01 - Grid Data",
      "item": "Grid Data",
      "frames": [
        {
          "png": "data/frames/KB01_Grid_Data/frame_0000.png",
          "tif": "data/frames/KB01_Grid_Data/frame_0000.tif",
          "time": "2000-01-01 00:00:00"
        }
      ],
      "extent3857": [
        11945609.673383405,
        1844372.186383094,
        12003387.847203607,
        1885606.501322023
      ],
      "legendItems": [
        {
          "color": "#440154",
          "label": "0.0002 - 0.655"
        },
        {
          "color": "#46317e",
          "label": "0.655 - 1.31"
        },
        {
          "color": "#365b8c",
          "label": "1.31 - 1.97"
        },
        {
          "color": "#277e8e",
          "label": "1.97 - 2.62"
        },
        {
          "color": "#1fa187",
          "label": "2.62 - 3.28"
        },
        {
          "color": "#49c16d",
          "label": "3.28 - 3.93"
        },
        {
          "color": "#9fd938",
          "label": "3.93 - 4.59"
        },
        {
          "color": "#fde724",
          "label": "4.59 - 5.24"
        }
      ]
    },
    {
      "id": "KB02_Grid_Data",
      "alias": "KB02",
      "caption": "KB02 - Grid Data",
      "item": "Grid Data",
      "frames": [
        {
          "png": "data/frames/KB02_Grid_Data/frame_0000.png",
          "tif": "data/frames/KB02_Grid_Data/frame_0000.tif",
          "time": "2000-01-01 00:00:00"
        }
      ],
      "extent3857": [
        11945609.673383405,
        1844372.186383094,
        12003387.847203607,
        1885606.501322023
      ],
      "legendItems": [
        {
          "color": "#440154",
          "label": "0.0001 - 0.89"
        },
        {
          "color": "#46317e",
          "label": "0.89 - 1.78"
        },
        {
          "color": "#365b8c",
          "label": "1.78 - 2.67"
        },
        {
          "color": "#277e8e",
          "label": "2.67 - 3.56"
        },
        {
          "color": "#1fa187",
          "label": "3.56 - 4.45"
        },
        {
          "color": "#49c16d",
          "label": "4.45 - 5.34"
        },
        {
          "color": "#9fd938",
          "label": "5.34 - 6.23"
        },
        {
          "color": "#fde724",
          "label": "6.23 - 7.12"
        }
      ]
    }
  ],
  "fullExtent3857": [
    11945609.673383405,
    1844372.186383094,
    12003387.847203607,
    1885606.501322023
  ],
  "sourceCrs": "EPSG:32648",
  "webCrs": "EPSG:3857",
  "backgroundEngine": "native qgis2web"
};
