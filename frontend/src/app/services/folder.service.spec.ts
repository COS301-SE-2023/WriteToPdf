import 'zone.js/dist/zone.js';
import 'zone.js/dist/zone-testing.js'; // Must add both these imports
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { FolderService } from './folder.service';

describe('FileService', () => {
  let service: FolderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FolderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
