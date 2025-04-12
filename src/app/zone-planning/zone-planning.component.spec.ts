import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZonePlanningComponent } from './zone-planning.component';

describe('ZonePlanningComponent', () => {
  let component: ZonePlanningComponent;
  let fixture: ComponentFixture<ZonePlanningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ZonePlanningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZonePlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
