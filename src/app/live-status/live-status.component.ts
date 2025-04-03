import { Component } from '@angular/core';
import { LiveStatusService } from './live-status.service';

@Component({
  selector: 'app-live-status',
  standalone: false,
  templateUrl: './live-status.component.html',
  styleUrl: './live-status.component.css'
})
export class LiveStatusComponent {
  constructor (private liveStatusService: LiveStatusService) {}
}
