import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Route } from './route';
import { Waypoint } from '../waypoint';
import { MapDataService } from '../map-data.service';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private baseUrl = 'http://127.0.0.1:8000';

  private updatedWaypoints: Waypoint[] = [];

  constructor(private http: HttpClient, private mapDataService: MapDataService) {}

  getRoutes(): Observable<Route[]> {
    return this.http.get<Route[]>(`${this.baseUrl}/getRoutes`);
  }

  createRoute(newRoute: { name: string, waypoints: Waypoint[] }): Observable<any> {
    return this.http.post(`${this.baseUrl}/createRoute`, newRoute);
  }

  deleteRoute(route: Route): Observable<any> {
    return this.http.get(`${this.baseUrl}/deleteRoute/${route.route_id}`)
  }

  updateRoute(route: Route): Observable<any> {
    this.mapDataService.waypoints$.subscribe(waypoints => {
      this.updatedWaypoints = waypoints;
    })
    var updatedRoute = {route_id: route.route_id, name: route.name, waypoints: this.updatedWaypoints};
    return this.http.post(`${this.baseUrl}/updateRoute`, updatedRoute)
  }
}