import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Route } from './route';
import { Waypoint } from '../waypoints/waypoint';
import { MapDataService } from '../map-data.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RouteService {

  constructor(private http: HttpClient, private mapDataService: MapDataService) {}

  getRoutes(): Observable<Route[]> {
    // return this.http.get<Route[]>(`${environment.apiURL}/getRoutes`);
    const headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true',
    });

    return this.http.get<Route[]>(
      `${environment.apiURL}/getRoutes`,
      { headers }
    );
  }

  createRoute(newRoute: { name: string, waypoints: Waypoint[] }): Observable<any> {
    return this.http.post(`${environment.apiURL}/createRoute`, newRoute);
  }

  deleteRoute(route: Route): Observable<any> {
    return this.http.get(`${environment.apiURL}/deleteRoute/${route.route_id}`)
  }

  updateRoute(route: Route): Observable<any> {
    const waypoints = this.mapDataService.currentWaypoints;
    var updatedRoute = {route_id: route.route_id, name: route.name, waypoints: waypoints};
    return this.http.post(`${environment.apiURL}/updateRoute`, updatedRoute)
  }
}