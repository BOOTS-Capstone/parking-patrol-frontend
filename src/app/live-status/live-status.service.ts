import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Violation } from '../violation';

@Injectable({
  providedIn: 'root'
})
export class LiveStatusService {

  constructor(private httpClient: HttpClient) { }

  getViolations(): Observable<Violation[]> {
    const url = `${environment.apiURL}/violations`;
    return this.httpClient.get<Violation[]>(url);
  }
}
