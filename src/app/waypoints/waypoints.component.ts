import { Component, Input, OnInit } from '@angular/core';
import { Waypoint } from './waypoint';
import { Route } from '../routes/route';
import { MapDataService } from '../map-data.service';

@Component({
  selector: 'app-waypoints',
  standalone: false,
  templateUrl: './waypoints.component.html',
  styleUrl: './waypoints.component.css'
})
//NO LONGER IN USE
export class WaypointsComponent {
  // @Input() route: Route | null = null;
  // waypoints: Waypoint[] = [];
  // @Input() routeCreationView: boolean = false;

  // allowEditing: boolean = false;

  // printWaypoint(wp: Waypoint) {
  //   console.log('waypoint: ' + JSON.stringify(wp));
  // }

  // constructor(public mapDataService: MapDataService) {}

  // ngOnInit(): void {
  //   this.mapDataService.waypoints$.subscribe(waypoints => {
  //     this.waypoints = waypoints;
  //   })
  // }
}
