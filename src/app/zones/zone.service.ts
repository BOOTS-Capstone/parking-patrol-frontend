import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Zone } from './zone';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  
  constructor(private http: HttpClient) { }

  addZone(zone: Zone): Observable<any> {
    const geoJson = this.createGeoJsonFeature(zone);
    return this.http.post(`${environment.apiURL}/zones`, geoJson, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      catchError(this.handleError)
    );
  }


  getZones(): Observable<Zone[]> {
    console.log("Fetching zones from server...");
    return this.http.get<Zone[]>(`${environment.apiURL}/getZones`).pipe(
      catchError(this.handleError)
    );
  }

  deleteZone(zone: Zone): Observable<void> {
    return this.http.delete<void>(`${environment.apiURL}/zones/${zone.id}`);
  }

  private createGeoJsonFeature(zone: Zone): any {
    const coordinates = this.ensureClosedPolygon(zone.coordinates);

    return {
      type: 'Feature',
      properties: {
        name: zone.name,
        zoneType: zone.type
      },
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates] // GeoJSON requires array of linear rings
      }
    };
  }

  private ensureClosedPolygon(coords: number[][]): number[][] {
    if (coords.length < 3) return coords;
    
    const first = coords[0];
    const last = coords[coords.length - 1];
    
    // Add first point if not already closed
    return first[0] === last[0] && first[1] === last[1] 
      ? coords 
      : [...coords, first];
  }

  private handleError(error: any) {
    console.error('Zone service error:', error);
    return throwError(() => new Error(error.message));
  }
}
