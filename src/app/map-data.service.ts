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

  /**
   * Sets the current route being edited. 
   * Also sets allowRouteEditing$ to true if route is not null.
   * If route is null, sets allowRouteEditing$ to false
   * @param route 
   */
  setRouteBeingEdited(route: Route | null) {
    // this.allowRouteEditingSource.next(allowRouteEditing);
    this.routeBeingEditedSource.next(route);
    if (route === null) {
      this.allowRouteEditingSource.next(false);
    } 
    else {
      this.allowRouteEditingSource.next(true);
    }
    console.log('Updated route being edited to: ' + JSON.stringify(route));
  }

  setAllowRouteEditing(value: boolean) {
    this.allowRouteEditingSource.next(value);
  }
}
