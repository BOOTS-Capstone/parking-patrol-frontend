import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Waypoint } from './waypoint';

import { map } from 'rxjs';
import { createMayBeForwardRefExpression } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class WaypointService {
  private baseUrl = 'http://127.0.0.1:8000';

  constructor(private httpClient: HttpClient) { }

  getWaypoints(route_id: number): Observable<Waypoint[]> {
    const url = `${this.baseUrl}/getWaypoints/${route_id}`;
    return this.httpClient.get<Waypoint[]>(url);
  }
}
