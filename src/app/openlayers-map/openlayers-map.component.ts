import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Input } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs';
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
import Overlay from 'ol/Overlay';
import { Stroke, Style, Icon, Fill } from 'ol/style';
import Draw from 'ol/interaction/Draw';
import { MapDataService } from '../map-data.service';
import { Waypoint } from '../waypoints/waypoint';
import { LiveStatusService } from '../live-status/live-status.service';
import { Violation } from '../violation';
import { env } from '../../../env';
import { DroneState } from '../live-status/drone-state';
import { ViolationFilterType } from '../live-status/live-status.service';
import { MapView } from './map-view.enum';
import { ZoneService } from '../zones/zone.service';
import { ZonesComponent } from '../zones/zones.component';
import { Zone } from '../zones/zone';

import Polygon from 'ol/geom/Polygon';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-openlayers-map',
  standalone: false,
  templateUrl: './openlayers-map.component.html',
  styleUrls: ['./openlayers-map.component.css']
})
export class OpenlayersMapComponent implements OnInit, AfterViewInit {
  @Input() currentView: MapView = MapView.RoutePlanning;
  MapView = MapView; 
  @ViewChild('mapElement', { static: false }) mapElement!: ElementRef;
  @ViewChild('popupElement', { static: false }) popupElement!: ElementRef;

  // Map components
  map!: Map;
  osmLayer!: TileLayer;
  satelliteLayer!: TileLayer;
  
  // Data stores
  waypoints: Waypoint[] = [];
  violations: Violation[] = [];
  drone_state!: DroneState;
  
  // Vector layers
  pathFeature!: Feature;
  vectorSource!: VectorSource;
  vectorLayer!: VectorLayer;
  markerSource!: VectorSource;
  markerLayer!: VectorLayer;
  overlay!: Overlay;
  
  // UI state
  popupContent: string = '';
  violationFilter: ViolationFilterType = 'unresolved';
  filterOptions = [
    { value: 'unresolved', label: 'Show Unresolved Only' },
    { value: 'resolved', label: 'Show Resolved Only' },
    { value: 'all', label: 'Show All Violations' }
  ];
  lastUpdateTime = new Date();
  showSpecialZones: boolean = false;
  
  // Subscriptions and flags
  private dronePollingSubscription?: Subscription;
  private isActive = true;
  private allowEditing: boolean = false;

  // Zone planning variables
  private zoneSource!: VectorSource;
  private zoneLayer!: VectorLayer;
  private currentZoneType: 'handicap' | 'fire' = 'fire';
  private drawInteraction!: any;
  private zonesComponent!: ZonesComponent;
  private zones: Zone[] = [];

  constructor(private mapDataService: MapDataService, private liveStatusService: LiveStatusService, private zoneService: ZoneService) {}

  ngOnInit(): void {
    this.mapDataService.allowRouteEditing$.subscribe(allowEditing => {this.allowEditing = allowEditing});
  }

  ngAfterViewInit(): void {
    this.initializeMap();
    if (this.currentView === MapView.LiveStatus) {
      this.setupLiveStatusView();
    } else if (this.currentView === MapView.RoutePlanning) {
      this.setupRoutePlanningView();
    } else if (this.currentView === MapView.ZonePlanning) {
      this.setupZonePlanningView();
    }
  }

  ngOnDestroy(): void {
    this.isActive = false;
    if (this.dronePollingSubscription) {
      this.dronePollingSubscription.unsubscribe();
    }
  }

  private setupLiveStatusView(): void {
    this.liveStatusService.getViolations(this.violationFilter).subscribe(violations => {
      this.violations = violations;
      this.updateMapWithViolations(violations);
    });
    this.startDronePolling();
    this.setupMapHoverInteraction();
  }

  private setupRoutePlanningView(): void {
    this.mapDataService.waypoints$.subscribe(waypoints => {
      this.waypoints = waypoints;
      this.updateMapWithWaypoints(waypoints);
    });
    if (this.allowEditing) {
      this.setupMapClickInteraction();
    }
  }

  toggleShowSpecialZones(): void {
    this.showSpecialZones = !this.showSpecialZones
    this.showSpecialZones ? console.log("showing special zones") : console.log("hiding special zones");
    if (this.showSpecialZones) {
      this.zoneSource = new VectorSource();
      this.zoneLayer = new VectorLayer({
        source: this.zoneSource,
        style: new Style({
          stroke: new Stroke({
            color: '#FF0000',
            width: 2
          }),
          fill: new Fill({
            color: 'rgba(255,0,0,0.2)'
          })
        })
      });
      this.map.addLayer(this.zoneLayer);
      this.zoneService.getZones().subscribe(zones => {
        this.updateMapWithZones(zones);
      })
    }
    else {
      this.zoneSource.clear();
    }
  }

  private setupZonePlanningView(): void {
    this.mapDataService.zones$.subscribe(zones => {
      this.zones = zones;
      console.log('Got zones: ');
      console.log(zones);
      this.updateMapWithZones(zones);
    })
    // Initialize zone vector layer
    this.zoneSource = new VectorSource();
    this.zoneLayer = new VectorLayer({
      source: this.zoneSource,
      style: new Style({
        stroke: new Stroke({
          color: '#FF0000',
          width: 2
        }),
        fill: new Fill({
          color: 'rgba(255,0,0,0.2)'
        })
      })
    });
    this.map.addLayer(this.zoneLayer);

    // Add polygon drawing interaction
    this.drawInteraction = new Draw({
      source: this.zoneSource,
      type: 'Polygon',
      freehand: false
    });
    
    this.map.addInteraction(this.drawInteraction);

    // Handle completed polygons
    this.drawInteraction.on('drawend', (evt: any) => {
      const polygon = evt.feature.getGeometry();
      const coords = polygon.getCoordinates()[0]
        .map((coord: number[]) => toLonLat(coord));
      
      // Remove duplicate closing coordinate
      coords.pop();
      
      this.mapDataService.notifyZoneCreation(coords);
      console.log('Zone created:', coords);
    });


    this.overlay = new Overlay({
      element: this.popupElement.nativeElement,
      autoPan: true,
    });
    this.map.addOverlay(this.overlay);
    
    this.mapDataService.selectedZone$.subscribe(zone => {
      if (!zone) {
        this.overlay.setPosition(undefined);
        return;
      }
    
      // find the feature added in updateMapWithZones
      const feature = this.zoneSource
        .getFeatures()
        .find(f => (f.get('zone') as Zone).id === zone.id);
    
      if (feature) {
        const extent = (feature.getGeometry() as Polygon).getExtent();
        const view = this.map.getView();
        view.fit(extent, {
          padding: [40, 40, 40, 40],
          duration: 500,
          minResolution: .25
        });
    
        // show a popup at its center
        const center: [number, number] = [
          (extent[0] + extent[2]) / 2,
          (extent[1] + extent[3]) / 2,
        ];
        this.popupContent = `
          <div style="padding:4px 8px; background:white; border:1px solid #333; border-radius:4px;">
            <strong>${zone.name}</strong><br>
            Type: ${zone.type}
          </div>
        `;
        this.overlay.setPosition(center);
      }
  });
}

  private startDronePolling(): void {
    this.fetchDroneState();
    this.dronePollingSubscription = interval(10000)
      .pipe(takeWhile(() => this.isActive))
      .subscribe(() => {
        this.fetchDroneState();
      });
  }

  private fetchDroneState(): void {
    this.liveStatusService.getDroneState().subscribe({
      next: (drone_state) => {
        this.drone_state = drone_state;
        this.lastUpdateTime = new Date();
        this.updateMapWithDroneState(drone_state);
      },
      error: (err) => {
        console.error('Error fetching drone state:', err);
      }
    });
  }

  private setupMapHoverInteraction(): void {
    this.map.on('pointermove', evt => {
      const pixel = this.map.getEventPixel(evt.originalEvent);
      const feature = this.map.forEachFeatureAtPixel(pixel, f => f, {
        hitTolerance: 5
      });
      if (feature) {
        const geometry = feature.getGeometry();
        if (geometry instanceof Point) {
          const coords = toLonLat(geometry.getCoordinates());
          const violation: Violation = feature.get('violation');
          const droneState: DroneState = feature.get('drone_state');
          if (violation) {
            const timestamp = new Date(violation.timestamp);
            this.popupContent = `
              <strong>Violation</strong><br>
              <strong>Plate:</strong> ${violation.plate_number} (${violation.plate_state})<br>
              <strong>Latitude:</strong> ${coords[1]}<br>
              <strong>Longitude:</strong> ${coords[0]}<br>
              <strong>Date:</strong> ${timestamp.toLocaleDateString()}<br>
              <strong>Time:</strong> ${timestamp.toLocaleTimeString()}<br>
            `;
          } else if (droneState) {
            this.popupContent = `
              <strong><u>Drone Location</u></strong><br>
              <strong>Latitude:</strong> ${coords[1]}<br>
              <strong>Longitude:</strong> ${coords[0]}<br>
              <strong>Last Update:</strong> ${this.lastUpdateTime.toLocaleTimeString()}
            `;
          }
          this.overlay.setPosition(geometry.getCoordinates());
          this.popupElement.nativeElement.style.display = 'block';
          return;
        }
      }
      this.overlay.setPosition(undefined);
      this.popupElement.nativeElement.style.display = 'none';
    });
  }

  private setupMapClickInteraction(): void {
    this.map.on('click', (event) => {
      const coordinate = toLonLat(event.coordinate);
      const newWaypoint: Waypoint = {
        latitude: coordinate[1],
        longitude: coordinate[0],
        waypoint_id: 0,
        route_id: 0,
        degrees_from_north: 0
      };
      this.waypoints.push(newWaypoint);
      this.updatePath('red');
      this.mapDataService.updateWaypoints(this.waypoints);
    });
  }

  initializeMap(): void {
    this.osmLayer = new TileLayer({
      source: new OSM(),
      visible: false
    });

    var mapURL;
    if (environment.useMaptilerMap) {
        mapURL = environment.mapURL + env.maptilerAPIKey
    } else {
      mapURL = environment.mapURL
    }
    this.satelliteLayer = new TileLayer({
      source: new XYZ({
        //free map
        url: mapURL
      }),
      visible: true
    });

    if (this.currentView === MapView.LiveStatus) {
      this.map = new Map({
        target: this.mapElement.nativeElement,
        layers: [this.satelliteLayer, this.osmLayer],
        view: new View({
          center: fromLonLat([-96.28172035011501, 30.60139275538404]),
          zoom: 19
        })
      });
      this.pathFeature = new Feature();
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
      this.markerSource = new VectorSource();
      this.markerLayer = new VectorLayer({
        source: this.markerSource,
        style: new Style({
          image: new Icon({
            src: 'upload.png',
            scale: 0.05,
          })
        })
      });
      this.map.addLayer(this.markerLayer);
      this.overlay = new Overlay({
        element: this.popupElement.nativeElement,
        autoPan: false,
      });
      this.map.addOverlay(this.overlay);
    } 
    else if (this.currentView === MapView.RoutePlanning) {
      this.map = new Map({
        target: this.mapElement.nativeElement,
        layers: [this.satelliteLayer, this.osmLayer],
        view: new View({
          center: fromLonLat([-96.3344, 30.6280]),
          zoom: 17
        })
      });
      this.pathFeature = new Feature();
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
      this.markerSource = new VectorSource();
      this.markerLayer = new VectorLayer({
        source: this.markerSource,
        style: new Style({
          image: new Icon({
            src: 'upload.png',
            scale: 0.05,
          })
        })
      });
      this.map.addLayer(this.markerLayer);
      this.map.on('click', (event) => {
        if (!this.allowEditing) return;
        const coordinate = toLonLat(event.coordinate);
        const newWaypoint: Waypoint = {
          latitude: coordinate[1],
          longitude: coordinate[0],
          waypoint_id: 0,
          route_id: 0,
          degrees_from_north: 0
        };
        this.waypoints.push(newWaypoint);
        this.updatePath('red');
        this.mapDataService.updateWaypoints(this.waypoints);
      });
    } 
    else if (this.currentView === MapView.ZonePlanning) {
      this.map = new Map({
        target: this.mapElement.nativeElement,
        layers: [this.satelliteLayer, this.osmLayer],
        view: new View({
          center: fromLonLat([-96.28172035011501, 30.60139275538404]),
          zoom: 17
        })
      });
    }
  }

  // 2) add the helper method to your component:
  private updateMapWithZones(zones: Zone[]): void {
    // clear any old features
    if (this.zoneSource) {
      this.zoneSource.clear();
    }

    zones.forEach(z => {
      const coordsProjected = z.coordinates.map(c => fromLonLat(c));
      const polygon = new Polygon([ coordsProjected ]);
      const feature = new Feature(polygon);

      const isHandicap = z.type === 'handicap';
      const strokeColor = isHandicap ? 'blue' : '#FF0000';
      const fillColor   = isHandicap ? 'rgba(0,0,255,0.2)' : 'rgba(255,0,0,0.2)';

      feature.setStyle(new Style({
        stroke: new Stroke({ color: strokeColor, width: 2 }),
        fill:   new Fill({   color: fillColor   })
      }));

      feature.set('zone', z);
      this.zoneSource.addFeature(feature);
    });
  }

  updatePath(color: string): void {
    if (this.waypoints.length < 2) return;
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

  finalizePath(): void {
    this.updatePath('blue');
  }

  clearPath(): void {
    this.waypoints = [];
    this.mapDataService.updateWaypoints([]);
    this.markerSource.clear();
    this.pathFeature.setGeometry(undefined);
  }

  toggleBaseLayer(): void {
    const isSatelliteVisible = this.satelliteLayer.getVisible();
    this.satelliteLayer.setVisible(!isSatelliteVisible);
    this.osmLayer.setVisible(isSatelliteVisible);
  }

  onViolationFilterChange(): void {
    this.updateViolations();
  }

  private updateViolations(): void {
    this.liveStatusService.getViolations(this.violationFilter).subscribe(
      violations => {
        this.violations = violations;
        this.updateMapWithViolations(violations);
      });
  }

  updateMapWithViolations(violations: Violation[]): void {
    const features = this.markerSource.getFeatures();
    const violationFeatures = features.filter(f => f.get('violation'));
    violationFeatures.forEach(f => this.markerSource.removeFeature(f));
    this.pathFeature.setGeometry(undefined);

    violations.forEach((violation: Violation) => {
      const coordinate = fromLonLat([violation.gps_long, violation.gps_lat]);
      const feature = new Feature({
        geometry: new Point(coordinate)
      });
      if (violation.resolved == false) {
        feature.setStyle(new Style({
          image: new Icon({
            src: 'violation.png',
            scale: 0.05
          })
        }));
      }
      else if (violation.resolved == true) {
        feature.setStyle(new Style({
          image: new Icon({
            src: 'green-check.png',
            scale: 0.05
          })
        }));
      }
      feature.set('violation', violation);
      this.markerSource.addFeature(feature);
    });
    if (violations.length > 1) {
      const extent = this.markerSource.getExtent();
      this.map.getView().fit(extent, { duration: 500, padding: [500, 500, 500, 500] });
    }
  }

  updateMapWithDroneState(drone_state: DroneState): void {
    const features = this.markerSource.getFeatures();
    const droneFeatures = features.filter(f => f.get('drone_state'));
    droneFeatures.forEach(f => this.markerSource.removeFeature(f));
    this.pathFeature.setGeometry(undefined);

    const coordinate = fromLonLat([drone_state.long, drone_state.lat]);
    const feature = new Feature({
      geometry: new Point(coordinate)
    });
    feature.setStyle(new Style({
      image: new Icon({
        src: 'drone.png',
        scale: 0.1
      })
    }));
    feature.set('drone_state', drone_state);
    this.markerSource.addFeature(feature);
  }

  updateMapWithWaypoints(waypoints: Waypoint[]): void {
    this.markerSource.clear();
    this.pathFeature.setGeometry(undefined);

    waypoints.forEach((wp: Waypoint) => {
      const coordinate = fromLonLat([wp.longitude, wp.latitude]);
      const rotation = wp.degrees_from_north ? wp.degrees_from_north * (Math.PI / 180) : 0;
      const feature = new Feature({
        geometry: new Point(coordinate)
      });
      feature.setStyle(new Style({
        image: new Icon({
          src: 'upload.png',
          rotation: rotation,
          scale: 0.05
        })
      }));
      this.markerSource.addFeature(feature);
    });
    this.updatePath('red');
    if (waypoints.length > 1) {
      const extent = this.markerSource.getExtent();
      this.map.getView().fit(extent, { duration: 1000, padding: [200, 200, 200, 200], minResolution: .25 });
    }
  }

  searchAddress(address: string): void {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    fetch(url)
      .then(response => response.json())
      .then(results => {
        if (results && results.length > 0) {
          const result = results[0];
          const lon = parseFloat(result.lon);
          const lat = parseFloat(result.lat);
          const coordinate = fromLonLat([lon, lat]);
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

  closePopup(event: MouseEvent) {
    event.preventDefault();
    this.overlay.setPosition(undefined);
  }
}