import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { OpenlayersMapComponent } from './openlayers-map/openlayers-map.component';
import { RoutesComponent } from './routes/routes.component';
import { WaypointsComponent } from './waypoints/waypoints.component';

@NgModule({
  declarations: [
    AppComponent,
    OpenlayersMapComponent,
    RoutesComponent,
    WaypointsComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
