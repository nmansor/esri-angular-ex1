import { Component, OnInit, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';

import { loadScript, loadModules } from 'esri-loader';
import { Observable } from 'rxjs';

import { HttpHeaders, HttpClient } from '@angular/common/http';
import { resolve, reject } from 'q';

import { request } from '@esri/arcgis-rest-request';

@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.css']
})
export class EsriMapComponent implements OnInit {

  // URL = 'https://server.arcgisonline.com/arcgis/rest/services/?f=json';

  URL = 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/PoolPermits/MapServer?f=pjson';
  ReqOptions = { responseType: 'json' };
  ServiceList: string[];


  @Output() wonderMapped = new EventEmitter(); // notfies the dashboard component when the mapp is finished
  @ViewChild('mapViewDiv', { static: false }) private viewNode: ElementRef; // needed to inject the MapView into the DOM
  @ViewChild('MapTypesButtonsDiv', { static: false}) private MapTypesButtonsDiv: ElementRef;

  mapView: __esri.MapView;
  esriConfig: any;
  Request: __esri.request;
  constructor(private httpclient: HttpClient) {
   
  }



public ngOnInit() {
  // use esri-loader to load JSAPI modules
 
  return loadModules([
    'esri/Map',
    'esri/views/MapView',
    'esri/Graphic',
    'esri/layers/MapImageLayer',
    'esri/layers/FeatureLayer',
    'esri/widgets/Legend',
    'esri/config',
    'esri/request',
    'request',
    'esri/core/Error',
    'esri/widgets/BasemapToggle',
    'esri/widgets/BasemapGallery'
  ]).then(([Map, MapView, Graphic, MapImageLayer, FeatureLayer, Legend, esriConfig, esriRequest, Request, esriError, BasemapToggel, BasemapGallery]) => {
      const map: __esri.Map = new Map({
        basemap: 'topo-vector' // 'hybrid'
      });

      this.mapView = new MapView({
        container: this.viewNode.nativeElement,
        center: [-118.80543,34.02700],// [-117.1616394868625, 32.7127455035969], //[17, 25]
        zoom: 12,
        map: map
      });

      const  legend = new Legend({view: this.mapView});
      this.mapView.ui.add(legend, 'bottom-left');
      
      // create a BasemapToggle widget.
      // var toggelMap = new BasemapToggel({
      //   view: this.mapView,
      //   nextBasemap: 'satellite'
      // });
 // add the widget to the bottom right corner
 // this.mapView.ui.add(toggelMap, 'bottom-right');

      var basemapGallery = new BasemapGallery({
        view: this.mapView,
        source: {
          portal: {
            url: 'http://www.arcgis.com',
            useVectorBasemaps: true, // Load vector tile basemap group
          },
        } 
      });
      // add the widget to the bottom right corner
      this.mapView.ui.add(basemapGallery, 'bottom-right');

      // Trailheads feature layer (points)
      const trailheadsLayer = new FeatureLayer({
        url: 'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads/FeatureServer/0'
      });
      map.add(trailheadsLayer, 0);

        // Parks and open spaces (polygons)
      const parksLayer = new FeatureLayer({
          url: 'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Parks_and_Open_Space/FeatureServer/0'
        });
      map.add(parksLayer, 1);

      // Trails feature layer (lines)
     // Set properties on a feature layer
      const trailsLayer = new FeatureLayer({
      url: 'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0',
      
      //*** Add, only draw trails with less than 250 ft of elevation  ***//
      definitionExpression: 'ELEV_GAIN < 250',

      //*** ADD ***//
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          color: 'green',
          width: '2px'
        }
      },

      //*** ADD ***//
      outFields: ['TRL_NAME', 'ELEV_GAIN'],

      //*** ADD ***//
      popupTemplate: {  // Enable a popup
        title: '{TRL_NAME}', // Show attribute value
        content: 'The trail elevation gain is {ELEV_GAIN} ft.'  // Display text in pop-up
      }
    });

         map.add(trailsLayer, 2);

    //   request(this.URL)
    //   .then( response => {
    //    // const result = response.data;
    //      for( let i = 0; i < response.layers.length; i++) {
    //         // this.ServiceList.push(response.layers[i]);
    //      }
    //     // map.removeAll();

    //   });
    })
    .catch(err => {
      console.log(err);
    });
}
 panMap(coordinates: number[]) {
        this.mapView.goTo(coordinates)
          .then(() => {
            this.mapView.zoom = 18;
            setTimeout(() => {
              this.wonderMapped.emit();
            }, 2000);
          });
      }

// getSList = (request) => {
//           let layeredRequest = request({
//             url: this.URL,
//             content: { f: 'json' },
//             handleAs: 'json',
//             callbackParameter: 'callback'
//           });
//           layeredRequest.then(function (response) {
//             const result = response.data;
//             let servciesList = String[20];
//             // for (let i = 0; i < result.length; i++) {
//             for (const val of result) {
//               servciesList.push(val);
//             }
//           },
//             function (error) {
//               console.log(error);
//             });
//         }

}

