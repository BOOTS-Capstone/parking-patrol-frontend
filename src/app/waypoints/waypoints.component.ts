import { Component, Input } from '@angular/core';
import { Waypoint } from '../waypoint';
import { Route } from '../routes/route';

@Component({
  selector: 'app-waypoints',
  standalone: false,
  templateUrl: './waypoints.component.html',
  styleUrl: './waypoints.component.css'
})
export class WaypointsComponent {
  @Input() route: Route | null = null;
  @Input() waypoints: Waypoint[] = [];
}
