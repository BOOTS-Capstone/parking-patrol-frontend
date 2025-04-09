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
  editingRoute: Route | null = null;
  newRouteName: string = '';

  routeEdited: boolean = false;

  constructor(
    private routeService: RouteService,
    private waypointService: WaypointService,
    private mapDataService: MapDataService  // Inject the shared service
  ) { }

  ngOnInit(): void {
    this.loadRoutes();
    this.mapDataService.allowRouteEditing$.subscribe((edited: boolean) => {
      this.routeEdited = edited;
      console.log('Route edited:', edited);
    });
  }

  loadRoutes(): void {
    this.routeService.getRoutes().subscribe(
      (data: Route[]) => {
        this.routes = data;
        console.log('Routes loaded:', this.routes);
        const savedSelectedRouteID = localStorage.getItem("selectedRouteID") ?? -1;
        if (savedSelectedRouteID != -1) {
          this.routes.forEach(route => {
            if (route.route_id == parseInt(savedSelectedRouteID)) {
              this.selectRoute(route);
            }
          })
        }
      },
      (error) => {
        console.error('Error loading routes:', error);
      }
    );
  }

  selectRoute(route: Route) {
    this.selectedRoute = route;
    localStorage.setItem("selectedRouteID", route.route_id.toString());
    this.editingRoute = null;
    this.mapDataService.setRouteBeingEdited(null);
    console.log("Selected route: " + route.name);
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

  editRoute(route: Route): void {
    // Clone the selected route so we don't modify the original before saving
    this.editingRoute = route;
    this.mapDataService.setRouteBeingEdited(this.editingRoute);
  }

  cancelEdit(): void {
    this.editingRoute = null; // Exit editing mode without saving
  }

  saveRoute(): void {
    if (!this.editingRoute) return;
    var route: any; //this is Route type
    this.mapDataService.routeBeingEdited$.subscribe(
      routeinfo => {route = routeinfo;
      // console.log('routeinfo ' + JSON.stringify(routeinfo))
      console.log('selectedRoute: ' + this.selectedRoute?.name);
      this.updateRoute(route);
    })
    // this.mapDataService.setRouteBeingEdited(null);
    // console.log(route);
    // this.mapDataService.setRouteBeingEdited(null);
    // Send the updated route to the backend
  }


  // Sends the new route and its waypoints to the createRoute endpoint.
  submitRoute(): void {
    // if (!this.newRouteName.trim() || this.waypoints.length === 0) {
    //   alert('Please enter a route name and add some waypoints on the map.');
    //   return;
    // }
    const waypoints = this.mapDataService.waypoints$.subscribe(waypoints => {
      this.waypoints = waypoints;
    })
    const newRoute = { name: this.newRouteName, waypoints: this.waypoints };
    this.routeService.createRoute(newRoute).subscribe(
      response => {
        console.log('New route created:', response);
        // Optionally, refresh the routes list.
        this.loadRoutes();
      },
      error => {
        console.error('Error creating route:', error);
      }
    );
  }

  deleteRoute(route: Route): void {
    if (confirm(`Are you sure you want to delete route "${route.name}"?`)) {
      this.routeService.deleteRoute(route).subscribe(
        response => {
          console.log('Route deleted:', response);
          // Refresh the list of routes.
          this.loadRoutes();
          // Optionally clear waypoints and selectedRoute if deleted route was selected.
          if (this.selectedRoute && this.selectedRoute.route_id === route.route_id) {
            this.selectedRoute = null;
            this.mapDataService.updateWaypoints([]);
          }
        },
        error => console.error('Error deleting route:', error)
      );
    }
  }

  updateRoute(route: Route): void {
    this.routeService.updateRoute(route).subscribe(
      response => {
        console.log('Updated route:', response);
        // Optionally, refresh the routes list.
        this.loadRoutes();
      },
      error => {
        console.error('Error updating route:', error);
      }
    );
  }
}
