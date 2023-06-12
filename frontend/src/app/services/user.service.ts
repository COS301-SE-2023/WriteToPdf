import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { LoginUserDTO } from './dto/login-user.dto';
import { CreateUserDTO } from './dto/create-user.dto';
import { first } from 'cypress/types/lodash';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private isAuthenticated: boolean = false;
  private authToken: string | null = null;

  constructor(private http: HttpClient) {}

  async login(email: string, password: string): Promise<boolean> {
    if (email === '' || password === '') {
      return new Promise<boolean>((resolve, reject) => {
        resolve(false);
      });
    }

    return new Promise<boolean>((resolve, reject) => {
      this.sendLoginData(email, password).subscribe({
        next: (response: HttpResponse<any>) => {
          console.log(response);
          console.log(response.status);

          if (response.status === 200) {
            console.log('Login successful');
            console.log(response.body.Token);
            this.isAuthenticated = true;
            this.authToken = response.body.Token;
            this.saveToLocalStorage('token', this.authToken);
            resolve(true);
          } else {
            resolve(false);
          }
        },
        error: (error) => {
          console.error(error); // Handle error if any
          resolve(false);
        },
      });
    });
  }




  async signup(firstName: string, lastName: string, email: string, password: string, confirmPassword: string): Promise<boolean> {
    if (password !== confirmPassword) {
      return new Promise<boolean>((resolve, reject) => {
        resolve(false);
      });
    }
    if (firstName === '' || lastName === '' || email === '' || password === '' || confirmPassword === '') {
      return new Promise<boolean>((resolve, reject) => {
        resolve(false);
      });
    }

    return new Promise<boolean>((resolve, reject) => {
      this.sendSignupData(email, firstName, lastName, password).subscribe({
        next: (response: HttpResponse<any>) => {
          console.log(response);
          console.log(response.status);

          if (response.status === 200) {
            console.log("Signup successful");
            resolve(true);
          } else {
            resolve(false);
          }
        },
        error: (error) => {
          console.error(error); // Handle error if any
          resolve(false);
        }
      });
    });
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


  sendLoginData(email: string, password: string): Observable<HttpResponse<any>> {
    const url = 'http://localhost:3000/users/login';
    const body = new LoginUserDTO();
    body.Email = email;
    body.Password = password;

    return this.http.post(url, body, { observe: 'response' });
  }
    

  sendSignupData(email: string, fName: string, lName: string, password: string) {
    const url = 'http://localhost:3000/users/signup';
    const body = new CreateUserDTO();
    body.FirstName = fName;
    body.LastName = lName;
    body.Email = email;
    body.Password = password;

    return this.http.post(url, body, { observe: 'response' });
  }

  saveToLocalStorage(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getFromLocalStorage(key: string): any {
    const value = localStorage.getItem(key);
    if (value) {
      return JSON.parse(value);
    }
    return null;
  }
}
