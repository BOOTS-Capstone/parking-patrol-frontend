import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Waypoint } from './waypoint'; // adjust path as needed

@Injectable({
  providedIn: 'root'
})
export class MapDataService {
  private waypointsSource = new BehaviorSubject<Waypoint[]>([]);
  waypoints$ = this.waypointsSource.asObservable();

  // Holds the edited state.
  private routeEditedSource = new BehaviorSubject<boolean>(false);
  routeEdited$ = this.routeEditedSource.asObservable();

  updateWaypoints(waypoints: Waypoint[]): void {
    this.setRouteEdited(false);
    this.waypointsSource.next(waypoints);
  }

  setRouteEdited(edited: boolean): void {
    this.routeEditedSource.next(edited);
  }
}
