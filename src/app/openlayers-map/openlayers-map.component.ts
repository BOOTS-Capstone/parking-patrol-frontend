import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Input } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import { fromLonLat, toLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { LineString, Point } from 'ol/geom';
import { Stroke, Style, Icon } from 'ol/style';
// import 'dotenv/config'

import { MapDataService } from '../map-data.service';
import { Waypoint } from '../waypoint'; // Your Waypoint interface
import { LiveStatusService } from '../live-status/live-status.service';
import { Violation } from '../violation';
import { env } from '../../../env';

@Component({
  selector: 'app-openlayers-map',
  standalone: false,
  templateUrl: './openlayers-map.component.html',
  styleUrls: ['./openlayers-map.component.css']
})
export class OpenlayersMapComponent implements OnInit, AfterViewInit {
  
  @Input() liveStatusView: boolean = false;
  @ViewChild('mapElement', { static: false }) mapElement!: ElementRef;

  map!: Map;
  osmLayer!: TileLayer;
  satelliteLayer!: TileLayer;
  
  // For drawing a temporary path using Waypoint objects.
  waypoints: Waypoint[] = [];
  violations: Violation[] = []
  pathFeature!: Feature;
  vectorSource!: VectorSource;
  vectorLayer!: VectorLayer;

  // Marker layer for displaying waypoints.
  markerSource!: VectorSource;
  markerLayer!: VectorLayer;

  private allowEditing: boolean = false;

  constructor(private mapDataService: MapDataService, private liveStatusService: LiveStatusService) {}

  ngOnInit(): void {
    this.mapDataService.allowRouteEditing$.subscribe(allowEditing => {this.allowEditing = allowEditing});
   }

  ngAfterViewInit(): void {

    // Subscribe to the shared service for waypoint updates.
    this.initializeMap();
    if (this.liveStatusView) {
      this.liveStatusService.getViolations().subscribe(violations => {
        this.violations = violations;
        this.updateMapWithViolations(violations);
        console.log(violations);
      });
    }
    
    else {
      
      this.mapDataService.waypoints$.subscribe((waypoints: Waypoint[]) => {
        this.waypoints = waypoints;
        this.updateMapWithWaypoints(waypoints);
      });
    }
  }


  initializeMap(): void {
    // Initialize the base layers.
    this.osmLayer = new TileLayer({
      source: new OSM(),
      visible: false // start with satellite view hidden
    });

    var maptilerKey = env.maptilerAPIKey;
    this.satelliteLayer = new TileLayer({
      source: new XYZ({
        //maptiler URL (requires API key)
        url: 'https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=' + maptilerKey

        //free map URL (use for testing purposes)
        // url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      }),
      visible: true // start with satellite view enabled
    });

    //we only want to draw the drone's location and violation locations
    if (this.liveStatusView) {
      // Initialize t he map centered on College Station, TX.
      this.map = new Map({
        target: this.mapElement.nativeElement,
        layers: [this.satelliteLayer, this.osmLayer],
        view: new View({
          center: fromLonLat([-96.28172035011501, 30.60139275538404]),
          zoom: 19
        })
      });
      // Create a feature to hold the drawn path.
      this.pathFeature = new Feature();

      // Create a vector source and layer for the drawn path.
      this.vectorSource = new VectorSource({ features: [this.pathFeature] });
      this.vectorLayer = new VectorLayer({
        source: this.vectorSource,
        style: new Style({
          stroke: new Stroke({
            color: 'red',
            width: 3
          })
        })
      });
      this.map.addLayer(this.vectorLayer);
      // Create a marker source and layer for the waypoints.
      this.markerSource = new VectorSource();
      this.markerLayer = new VectorLayer({
        source: this.markerSource,
        style: new Style({
          image: new Icon({
            src: 'upload.png', // Replace with your marker image path.
            scale: 0.05,
          })
          // For testing purposes, you could use a simple circle style:
          // image: new CircleStyle({
          //   radius: 6,
          //   fill: new Fill({ color: 'blue' })
          // })
        })
      });
      this.map.addLayer(this.markerLayer);
    }


    else {
      // Initialize the map centered on College Station, TX.
      this.map = new Map({
        target: this.mapElement.nativeElement,
        layers: [this.satelliteLayer, this.osmLayer],
        view: new View({
          center: fromLonLat([-96.3344, 30.6280]),
          zoom: 17
        })
      });

      // Create a feature to hold the drawn path.
      this.pathFeature = new Feature();

      // Create a vector source and layer for the drawn path.
      this.vectorSource = new VectorSource({ features: [this.pathFeature] });
      this.vectorLayer = new VectorLayer({
        source: this.vectorSource,
        style: new Style({
          stroke: new Stroke({
            color: 'red',
            width: 3
          })
        })
      });
      this.map.addLayer(this.vectorLayer);

      // Create a marker source and layer for the waypoints.
      this.markerSource = new VectorSource();
      this.markerLayer = new VectorLayer({
        source: this.markerSource,
        style: new Style({
          image: new Icon({
            src: 'upload.png', // Replace with your marker image path.
            scale: 0.05,
          })
          // For testing purposes, you could use a simple circle style:
          // image: new CircleStyle({
          //   radius: 6,
          //   fill: new Fill({ color: 'blue' })
          // })
        })
      });
      this.map.addLayer(this.markerLayer);

      // Add a click event to capture coordinates for the drawn path.
      this.map.on('click', (event) => {
        if (!this.allowEditing) {
          // If not in edit mode, ignore clicks.
          return;
        }
        // Convert clicked coordinate to [longitude, latitude]
        const coordinate = toLonLat(event.coordinate);
        // Create a Waypoint object (note: toLonLat returns [lon, lat])
        const newWaypoint: Waypoint = {
          latitude: coordinate[1],
          longitude: coordinate[0],
          waypoint_id: 0,
          route_id: 0,
          degrees_from_north: 0
        };
        // Add the new waypoint to the array.
        this.waypoints.push(newWaypoint);
        // Update the path using the updated waypoints.
        this.updatePath('red');
        this.mapDataService.updateWaypoints(this.waypoints);
        // console.log(this.waypoints)
      });
    }
  }

  // Update the drawn path with a specified color using the Waypoint objects.
  updatePath(color: string): void {
    if (this.waypoints.length < 2) return; // need at least 2 points for a line
    // Map each Waypoint to the coordinate array expected by fromLonLat.
    const transformedCoords = this.waypoints.map(wp =>
      fromLonLat([wp.longitude, wp.latitude])
    );
    this.pathFeature.setGeometry(new LineString(transformedCoords));
    this.vectorLayer.setStyle(new Style({
      stroke: new Stroke({
        color: color,
        width: 3
      })
    }));
  }

  // Finalize the path by changing its color to blue.
  finalizePath(): void {
    this.updatePath('blue');
  }

  // Clear the current path.
  clearPath(): void {
    this.waypoints = [];
    this.markerSource.clear();
    this.pathFeature.setGeometry(undefined);
  }

  // Toggle between satellite and OSM base layers.
  toggleBaseLayer(): void {
    const isSatelliteVisible = this.satelliteLayer.getVisible();
    this.satelliteLayer.setVisible(!isSatelliteVisible);
    this.osmLayer.setVisible(isSatelliteVisible);
  }

  // Update the marker layer with new waypoints.
  updateMapWithViolations(violations: Violation[]): void {
    // Clear existing markers.
    this.markerSource.clear();
    this.pathFeature.setGeometry(undefined);


    violations.forEach((violation: Violation) => {
      console.log(violation);
      // Convert from longitude/latitude to the map projection.
      const coordinate = fromLonLat([violation.gps_long, violation.gps_lat]);
      const feature = new Feature({
        geometry: new Point(coordinate)
      });
      feature.setStyle(new Style({
        image: new Icon({
          src: 'violation.png',
          // anchor: [1, 1],
          scale: 0.05
        })
      }));
      this.markerSource.addFeature(feature);
    });
    // Optionally, adjust the view to show all markers.
    if (violations.length > 1) {
      const extent = this.markerSource.getExtent();
      this.map.getView().fit(extent, { duration: 500, padding: [500, 500, 500, 500] });
    }
    
  }
  

  // Update the marker layer with new waypoints.
  updateMapWithWaypoints(waypoints: Waypoint[]): void {
    // Clear existing markers.
    this.markerSource.clear();
    this.pathFeature.setGeometry(undefined);


    waypoints.forEach((wp: Waypoint) => {
      // Convert from longitude/latitude to the map projection.
      const coordinate = fromLonLat([wp.longitude, wp.latitude]);
      const rotation = wp.degrees_from_north ? wp.degrees_from_north * (Math.PI / 180) : 0;
      const feature = new Feature({
        geometry: new Point(coordinate)
      });
      feature.setStyle(new Style({
        image: new Icon({
          src: 'upload.png',
          // anchor: [1, 1],
          rotation: rotation,
          scale: 0.05
        })
      }));
      this.markerSource.addFeature(feature);
    });
    this.updatePath('red');
    // Optionally, adjust the view to show all markers.
    if (waypoints.length > 1) {
      const extent = this.markerSource.getExtent();
      this.map.getView().fit(extent, { duration: 1000, padding: [200, 200, 200, 200] });
    }
    console.log(this.waypoints);
  }

    // New method to search for an address using Nominatim.
    searchAddress(address: string): void {
      // Construct the URL for the Nominatim API.
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
      
      // Fetch the geocoding results.
      fetch(url)
        .then(response => response.json())
        .then(results => {
          if (results && results.length > 0) {
            // For this example, take the first result.
            const result = results[0];
            const lon = parseFloat(result.lon);
            const lat = parseFloat(result.lat);
            const coordinate = fromLonLat([lon, lat]);
            // Animate the map view to the result.
            if (this.waypoints.length > 1) {
              this.map.getView().animate({ center: coordinate, zoom: 16, duration: 1000 });
            }
          } else {
            console.error('No results found for address:', address);
          }
        })
        .catch(error => {
          console.error('Error fetching geocoding results:', error);
        });
    }
}
