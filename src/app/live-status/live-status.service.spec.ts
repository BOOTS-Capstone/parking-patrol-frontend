import { TestBed } from '@angular/core/testing';

import { LiveStatusService } from './live-status.service';

describe('LiveStatusService', () => {
  let service: LiveStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiveStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
