import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Waypoint } from './waypoint'; // adjust path as needed

@Injectable({
  providedIn: 'root'
})
export class MapDataService {
  private waypointsSource = new BehaviorSubject<Waypoint[]>([]);
  waypoints$ = this.waypointsSource.asObservable();

  updateWaypoints(waypoints: Waypoint[]): void {
    this.waypointsSource.next(waypoints);
  }
}
