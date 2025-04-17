import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Waypoint } from './waypoint';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WaypointService {

  constructor(private httpClient: HttpClient) { }

  getWaypoints(route_id: number): Observable<Waypoint[]> {
    const url = `${environment.apiURL}/getWaypoints/${route_id}`;
    return this.httpClient.get<Waypoint[]>(url);
  }
}
