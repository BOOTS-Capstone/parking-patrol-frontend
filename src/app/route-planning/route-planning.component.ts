import { Component } from '@angular/core';
import { MapView } from '../openlayers-map/map-view.enum';

@Component({
  selector: 'app-route-planning',
  standalone: false,
  templateUrl: './route-planning.component.html',
  styleUrl: './route-planning.component.css'
})
export class RoutePlanningComponent {
  MapView = MapView
}
