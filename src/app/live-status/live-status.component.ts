import { Component } from '@angular/core';
import { LiveStatusService } from './live-status.service';
import { MapView } from '../openlayers-map/map-view.enum';

@Component({
  selector: 'app-live-status',
  standalone: false,
  templateUrl: './live-status.component.html',
  styleUrl: './live-status.component.css'
})
export class LiveStatusComponent {
  MapView = MapView;
  constructor (private liveStatusService: LiveStatusService) {}
}
