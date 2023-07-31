import { Injectable } from '@angular/core';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from './services/user.service';
import { Inject } from '@angular/core';
import { enc } from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(
    private userService: UserService,
    @Inject(Router) private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {

    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const authToken = localStorage.getItem('authToken');
    const userID = localStorage.getItem('userID');
    const expiresAt = localStorage.getItem('expiresAt');
    const email = localStorage.getItem('email');
    const firstName = localStorage.getItem('firstName');
    const encryptionKey = localStorage.getItem('encryptionKey');

    if (isAuthenticated && authToken && userID && expiresAt && email && firstName && encryptionKey) {

      this.userService.setAuthenticated(isAuthenticated === 'true');
      this.userService.setAuthToken(authToken);
      this.userService.setUserID(parseInt(userID));
      this.userService.setExpiresAt(new Date(expiresAt));
      this.userService.setEmail(email);
      this.userService.setFirstName(firstName);
      this.userService.setEncryptionKey(encryptionKey);
    }
    if (this.userService.isAuthenticatedUser()) {
      // User is authenticated, allow access
      return true;
    } else {
      // User is not authenticated, redirect to login page or a restricted access page
      return this.router.parseUrl('/login');
    }
  }
}
