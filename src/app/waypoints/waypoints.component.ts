import { Component, Input } from '@angular/core';
import { Waypoint } from '../waypoint';
import { Route } from '../routes/route';
import { MapDataService } from '../map-data.service';

@Component({
  selector: 'app-waypoints',
  standalone: false,
  templateUrl: './waypoints.component.html',
  styleUrl: './waypoints.component.css'
})
export class WaypointsComponent {
  @Input() route: Route | null = null;
  @Input() waypoints: Waypoint[] = [];

  allowEditing: boolean = false;

  printWaypoint(wp: Waypoint) {
    console.log('waypoint: ' + JSON.stringify(wp));
  }

  constructor(public mapDataService: MapDataService) {}
}
