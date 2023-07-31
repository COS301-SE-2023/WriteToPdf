import { TestBed } from '@angular/core/testing';

import { CoordinateServiceService } from './coordinate-service.service';

describe('CoordinateServiceService', () => {
  let service: CoordinateServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoordinateServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
