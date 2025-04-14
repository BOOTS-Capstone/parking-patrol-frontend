import { Component } from '@angular/core';
import { MapView } from '../openlayers-map/map-view.enum';

@Component({
  selector: 'app-zone-planning',
  standalone: false,
  templateUrl: './zone-planning.component.html',
  styleUrl: './zone-planning.component.css'
})
export class ZonePlanningComponent {
  MapView = MapView;
}
