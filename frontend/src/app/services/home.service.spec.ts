import 'zone.js/dist/zone.js';
import 'zone.js/dist/zone-testing.js'; // Must add both these imports
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { HomeService } from './home.service';

describe('HomeService', () => {
  let service: HomeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HomeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
