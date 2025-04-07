import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Violation } from '../violation';
import { DroneState } from './drone-state';

export type ViolationFilterType = 'all' | 'resolved' | 'unresolved';

@Injectable({
  providedIn: 'root'
})
export class LiveStatusService {

  constructor(private httpClient: HttpClient) {

  }

  getViolations(filter: ViolationFilterType = 'unresolved'): Observable<Violation[]> {
    var params = new HttpParams().set("violation_type", filter)
    return this.httpClient.get<Violation[]>(`${environment.apiURL}/violations`, {params});
  }

  getDroneState(): Observable<DroneState> {
    const url = `${environment.apiURL}/drone-state`;
    return this.httpClient.get<DroneState>(url);
  }
}
