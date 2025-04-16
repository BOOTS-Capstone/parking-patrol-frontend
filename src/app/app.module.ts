import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { OpenlayersMapComponent } from './openlayers-map/openlayers-map.component';
import { RoutesComponent } from './routes/routes.component';
import { WaypointsComponent } from './waypoints/waypoints.component';
import { LiveStatusComponent } from './live-status/live-status.component';
import { RoutePlanningComponent } from './route-planning/route-planning.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { ZonesComponent } from './zones/zones.component';
import { ZonePlanningComponent } from './zone-planning/zone-planning.component';
import { NgrokInterceptor } from './ngrok.interceptor';

import { environment } from '../environments/environment';

export const routes = [
  {path: 'live-status', component: LiveStatusComponent},
  {path: 'route-planning', component: RoutePlanningComponent},
  {path: '', component: RoutePlanningComponent},
  {path: 'zones', component: ZonePlanningComponent},

  //it's unhappy with the pathMatch value, idk why
  // {path: '', redirectTo: '/route-planning', pathMatch: "full" },
];

@NgModule({
  declarations: [
    AppComponent,
    OpenlayersMapComponent,
    RoutesComponent,
    WaypointsComponent,
    LiveStatusComponent,
    RoutePlanningComponent,
    TopBarComponent,
    ZonesComponent,
    ZonePlanningComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes),
],
  exports: [
    RouterModule
  ],
  providers: [
    (environment.useNgrokInterceptor
      ? [{
          provide: HTTP_INTERCEPTORS,
          useClass: NgrokInterceptor,
          multi: true
        }]
      : [])
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
