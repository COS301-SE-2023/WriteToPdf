import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private isAuthenticated: boolean = false;
  private authToken: string | null = null;

  constructor() { }

  login(username: string, password: string): boolean {
    // Perform authentication logic here (e.g., send login request to server)
    // If authentication is successful, set isAuthenticated to true and store the token
    if (username === 'test' && password === '123456') {
      this.isAuthenticated = true;
      this.authToken = 'sample-auth-token';
      return true;
    }

    return false;
  }

  logout(): void {
    // Perform logout logic here (e.g., clear authentication token, reset flags)
    this.isAuthenticated = false;
    this.authToken = null;
  }

  isAuthenticatedUser(): boolean {
    // Return the authentication status
    return this.isAuthenticated;
  }

  getAuthToken(): string | null {
    // Return the authentication token
    return this.authToken;
  }
}
