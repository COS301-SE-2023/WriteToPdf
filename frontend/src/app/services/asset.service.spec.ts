import 'zone.js/dist/zone.js';
import 'zone.js/dist/zone-testing.js'; // Must add both these imports
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { AssetService } from './asset.service';

describe('AssetService', () => {
  let service: AssetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
