import { TestBed } from '@angular/core/testing';

import { VersioningApiService } from './versioning-api.service';

describe('VersioningApiService', () => {
  let service: VersioningApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VersioningApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
