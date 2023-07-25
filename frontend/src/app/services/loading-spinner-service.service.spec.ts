import { TestBed } from '@angular/core/testing';

import { LoadingSpinnerService } from './loading-spinner-service.service';

describe('LoadingSpinnerServiceService', () => {
  let service: LoadingSpinnerServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingSpinnerServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
