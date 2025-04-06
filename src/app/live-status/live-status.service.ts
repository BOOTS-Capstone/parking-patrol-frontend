import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Violation } from '../violation';
import { DroneState } from './drone-state';

@Injectable({
  providedIn: 'root'
})
export class LiveStatusService {

  constructor(private httpClient: HttpClient) { }

  getViolations(): Observable<Violation[]> {
    const url = `${environment.apiURL}/violations`;
    return this.httpClient.get<Violation[]>(url);
  }

  getDroneState(): Observable<DroneState> {
    const url = `${environment.apiURL}/drone-state`;
    return this.httpClient.get<DroneState>(url);
  }
}
