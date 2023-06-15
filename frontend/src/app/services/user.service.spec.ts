import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service). toBeTruthy();
  });
});
