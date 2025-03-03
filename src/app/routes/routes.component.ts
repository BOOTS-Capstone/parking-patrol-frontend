import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { RouteService } from './route.service';
import { WaypointService } from '../waypoint.service';
import { Route } from './route';
import { Waypoint } from '../waypoint';
import { MapDataService } from '../map-data.service';

@Component({
  selector: 'app-routes',
  standalone: false,
  templateUrl: './routes.component.html',
  styleUrls: ['./routes.component.css']
})
export class RoutesComponent implements OnInit {
  routes: Route[] = [];
  waypoints: Waypoint[] = [];
  selectedRoute: Route | null = null;

  constructor(
    private routeService: RouteService,
    private waypointService: WaypointService,
    private mapDataService: MapDataService  // Inject the shared service
  ) { }

  ngOnInit(): void {
    this.loadRoutes();
  }

  loadRoutes(): void {
    this.routeService.getRoutes().subscribe(
      (data: Route[]) => {
        this.routes = data;
        console.log('Routes loaded:', this.routes);
      },
      (error) => {
        console.error('Error loading routes:', error);
      }
    );
  }

  selectRoute(route: Route) {
    this.selectedRoute = route;
    console.log("Selected route: " + route.route_id);
    this.getWaypointsOfRoute(route);
  }

  getWaypointsOfRoute(route: Route): void {
    this.waypointService.getWaypoints(route.route_id).subscribe(waypoints => {
      this.waypoints = waypoints;
      console.log(waypoints);
      // Update the shared map data service with the new waypoints.
      this.mapDataService.updateWaypoints(waypoints);
    });
  }
}
