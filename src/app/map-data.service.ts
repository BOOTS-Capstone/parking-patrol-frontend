import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { Waypoint } from './waypoint'; // adjust path as needed
import { Route } from './routes/route';

@Injectable({
  providedIn: 'root'
})
export class MapDataService {
  private waypointsSource = new BehaviorSubject<Waypoint[]>([]);
  waypoints$ = this.waypointsSource.asObservable();

  // Holds the edited state.
  private allowRouteEditingSource = new BehaviorSubject<boolean>(false);
  allowRouteEditing$ = this.allowRouteEditingSource.asObservable();

  // Holds the edited route.
  private routeBeingEditedSource = new BehaviorSubject<Route|null>(null);
  routeBeingEdited$ = this.routeBeingEditedSource.asObservable();

  updateWaypoints(waypoints: Waypoint[]): void {
    this.waypointsSource.next(waypoints);
    // this.allowRouteEditingSource.next(false);
    // this.routeBeingEditedSource.next(null)
  }

  // setRouteEdited(route: Route): void {
  //   this.routeEditedSource.next(route);
  // }

  setRouteBeingEdited(route: Route | null) {
    // this.allowRouteEditingSource.next(allowRouteEditing);
    this.routeBeingEditedSource.next(route);
    console.log('Updated route being edited to: ' + JSON.stringify(route));
  }
}
