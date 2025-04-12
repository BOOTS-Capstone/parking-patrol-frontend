import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { ZoneService } from './zone.service';
// import { WaypointService } from '../waypoint.service';
import { Zone } from './zone';
// import { Waypoint } from '../waypoint';
import { MapDataService } from '../map-data.service';


@Component({
  selector: 'app-zones',
  standalone: false,
  templateUrl: './zones.component.html',
  styleUrl: './zones.component.css'
})
export class ZonesComponent {
  zones: Zone[] = [];
  selectedZone: Zone | null = null;
  editingZone: Zone | null = null;
  newZoneName: string = '';

  zoneEdited: boolean = false;
  zoneCreationView: boolean = false;

  constructor(
    private zoneService: ZoneService,
    // private waypointService: WaypointService,
    private mapDataService: MapDataService  // Inject the shared service
  ) { }

  ngOnInit(): void {
    this.zoneCreationView = false;
    // this.loadZones();
    this.mapDataService.allowRouteEditing$.subscribe((edited: boolean) => {
      this.zoneEdited = edited;
      console.log('Zone edited:', edited);
    });
  }

  // loadZones(): void {
  //   this.zoneService.getZones().subscribe(
  //     (data: Zone[]) => {
  //       this.zones = data;
  //       console.log('Zones loaded:', this.zones);
  //       const savedSelectedZoneID = localStorage.getItem("selectedZoneID") ?? -1;
  //       if (savedSelectedZoneID != -1) {
  //         this.zones.forEach(zone => {
  //           if (zone.zone_id == parseInt(savedSelectedZoneID)) {
  //             this.selectZone(zone);
  //           }
  //         })
  //       }
  //     },
  //     (error) => {
  //       console.error('Error loading zones:', error);
  //     }
  //   );
  // }

}
