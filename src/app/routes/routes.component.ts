import { Component, OnInit } from '@angular/core';
import { Observable,take, combineLatest } from 'rxjs';

import { RouteService } from './route.service';
import { WaypointService } from '../waypoints/waypoint.service';
import { Route } from './route';
import { Waypoint } from '../waypoints/waypoint';
import { MapDataService } from '../map-data.service';
import { textHeights } from 'ol/render/canvas';


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
  newRouteName: string = '';

  routeEdited: boolean = false;
  routeCreationView: boolean = false;

  //used when editing waypoints to restore old info when the user clicks cancel
  private _waypointsSnapshot: Waypoint[] = [];

  constructor(
    private routeService: RouteService,
    private waypointService: WaypointService,
    public mapDataService: MapDataService  // Inject the shared service
  ) { }

  ngOnInit(): void {
    this.routeCreationView = false;
    this.loadRoutes();
    this.mapDataService.allowRouteEditing$.subscribe((edited: boolean) => {
      this.routeEdited = edited;
      console.log('Route edited:', edited);
    });
    this.mapDataService.waypoints$.subscribe(waypoints => {
      this.waypoints = waypoints;
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
    this.cancelEdit();
    this.selectedRoute = route;
    localStorage.setItem("selectedRouteID", route.route_id.toString());
    this.mapDataService.setRouteBeingEdited(null);
    this.mapDataService.setAllowRouteEditing(false);
    console.log("Selected route: " + route.name);

    //update waypoints in the shares service
    this.getWaypointsOfRoute(route)
  }

  getWaypointsOfRoute(route: Route): void {
    this.waypointService.getWaypoints(route.route_id)
      .subscribe(waypoints => this.mapDataService.updateWaypoints(waypoints));
  }

  selectPreviousRoute() {
    const savedSelectedRouteID = localStorage.getItem("selectedRouteID") ?? -1;
    if (savedSelectedRouteID != -1) {
      this.routes.forEach(route => {
        if (route.route_id == parseInt(savedSelectedRouteID)) {
          this.selectRoute(route);
        }
      })
    }
    this.routeCreationView = false;
  }


  editRoute(route: Route): void {
    this._waypointsSnapshot = this.waypoints.map(wp => ({ ...wp }));
    this.mapDataService.setRouteBeingEdited(route);
    this.mapDataService.setAllowRouteEditing(true);
  }

  updateWaypointData() {
    // console.log(this.waypoints)
    this.mapDataService.updateWaypoints(this.waypoints)
  }

  cancelEdit(): void {
    this.mapDataService.updateWaypoints(this._waypointsSnapshot);
    this._waypointsSnapshot = [];
    this.mapDataService.setRouteBeingEdited(null);
    this.mapDataService.setAllowRouteEditing(false);
  }

  // Saves changes made to an existing route
  saveRoute(): void {
    // this.mapDataService.setRouteBeingEdited(null);
    this.mapDataService.setAllowRouteEditing(false);
    this.mapDataService.routeBeingEdited$
      .pipe(take(1))
      .subscribe(route => {
        if (!route) { return; }

        this.routeService.updateRoute(route).subscribe(
          _ => {
            this.loadRoutes();
            this.mapDataService.setRouteBeingEdited(null);
            
            // this.cancelEdit();
          },
          err => console.error('Error updating route', err)
        );
      });
  }


  // Sends the new route and its waypoints to the createRoute endpoint.
  submitRoute(): void {
    if (!this.newRouteName.trim() && this.waypoints.length === 0) {
      alert('Please enter a route name and at add least two waypoints to the new route');
      return;
    }
    else if (!this.newRouteName.trim()) {
       alert('Please enter a name for the new route (40 characters');
       return;
    }
    else if (this.waypoints.length === 0) {
      alert(`Please add at least two waypoints to the new route`);
    }
    else if(this.newRouteName.length > 45) {
      alert(`Route name is too long. Please enter 40 characters or less (Currently at ${this.newRouteName.length} characters)`);
      return;
    }
    this.routeCreationView = false;
    this.mapDataService.setAllowRouteEditing(false);

    const waypoints = this.mapDataService.currentWaypoints;
    const newRoute = { name: this.newRouteName, waypoints: waypoints };
    this.routeService.createRoute(newRoute).subscribe(
      response => {
        console.log('New route created:', response);
        // Optionally, refresh the routes list.
        this.loadRoutes();
        this.routeCreationView = false;
        this.mapDataService.setAllowRouteEditing(false);
      },
      error => {
        console.error('Error creating route:', error);
      }
    );
    this.newRouteName = '';

  }

  onCreateRouteClick() {
    this.routeCreationView = true; 
    this.selectedRoute = null;
    this.mapDataService.updateWaypoints([]);
    this.mapDataService.setAllowRouteEditing(true); 
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

  removeWaypoint(index: number) {
    const updated = this.waypoints.slice(); 
    updated.splice(index, 1);
    this.mapDataService.updateWaypoints(updated);
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

  clearCurrentWaypoints(): void {
    if(confirm("This will remove all waypoints from the current route, are you sure you wish to proceed?")) {
      this.mapDataService.updateWaypoints([]);
    }
  }


}
