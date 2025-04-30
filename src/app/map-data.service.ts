import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { Waypoint } from './waypoints/waypoint'; // adjust path as needed
import { Route } from './routes/route';
import { Zone } from './zones/zone';

@Injectable({
  providedIn: 'root'
})
export class MapDataService {
  private waypointsSource = new BehaviorSubject<Waypoint[]>([]);
  waypoints$ = this.waypointsSource.asObservable();

  
  private allowRouteEditingSource = new BehaviorSubject<boolean>(false);
  allowRouteEditing$ = this.allowRouteEditingSource.asObservable();

  private routeBeingEditedSource = new BehaviorSubject<Route|null>(null);
  routeBeingEdited$ = this.routeBeingEditedSource.asObservable();

  private selectedZoneSource = new BehaviorSubject<Zone|null>(null);
  selectedZone$ = this.selectedZoneSource.asObservable();

  updateWaypoints(waypoints: Waypoint[]): void {
    this.waypointsSource.next(waypoints);
    console.log("Got updated waypoints: ");
    this.waypointsSource.forEach(waypoint => {
      console.log(waypoint)
    })
  }

  get currentWaypoints(): Waypoint[] {
    return this.waypointsSource.getValue();
  }

  get allowRouteEditing(): boolean {
    return this.allowRouteEditingSource.getValue();
  }

  private zonesSource = new BehaviorSubject<Zone[]>([]);
  zones$ = this.zonesSource.asObservable();

  updateZones(zones: Zone[]) {
    this.zonesSource.next(zones);
  }

  private zoneCreatedSource = new Subject<[number, number][]>();
  zoneCreated$ = this.zoneCreatedSource.asObservable();
  
  notifyZoneCreation(coordinates: [number, number][]) {
    this.zoneCreatedSource.next(coordinates);
  }

  setSelectedZone(zone: Zone|null) {
    this.selectedZoneSource.next(zone);
  }


  /**
   * Sets the current route being edited. 
   * @param route 
   */
  setRouteBeingEdited(route: Route | null) {
    // this.allowRouteEditingSource.next(allowRouteEditing);
    this.routeBeingEditedSource.next(route);
    console.log('Updated route being edited to: ' + JSON.stringify(route));
  }

  setAllowRouteEditing(value: boolean) {
    this.allowRouteEditingSource.next(value);
  }
}
