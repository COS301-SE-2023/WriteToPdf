import { Injectable } from '@angular/core';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class VersionControlService {
  constructor(private testString: UserService) {}

  test(): void {
    console.log('Here in test');
  }
}
