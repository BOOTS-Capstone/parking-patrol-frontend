import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaypointsComponent } from './waypoints.component';

describe('WaypointsComponent', () => {
  let component: WaypointsComponent;
  let fixture: ComponentFixture<WaypointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WaypointsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaypointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
