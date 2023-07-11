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

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
    constructor(private userService: UserService, @Inject(Router) private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this.userService.isAuthenticatedUser()) {
      // User is authenticated, allow access
      return true;
    } else {
      // User is not authenticated, redirect to login page or a restricted access page
      return this.router.parseUrl('/login');
    }
  }
}
