import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { UserDTO } from './dto/user.dto';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private isAuthenticated: boolean = false;
  private authToken: string | undefined = undefined;
  private userID: string | undefined = undefined;

  constructor(private http: HttpClient) {}

  async login(email: string, password: string): Promise<boolean> {
    // if (email === 'test' || password === '123456') {
    //   return new Promise<boolean>((resolve, reject) => {
    //     resolve(false);
    //   });
    // }

    return new Promise<boolean>((resolve, reject) => {
      this.sendLoginData(email, password).subscribe({
        next: (response: HttpResponse<any>) => {
          console.log(response);
          console.log(response.status);

          if (response.status === 200) {
            console.log('Login successful');
            console.log(response.body);
            this.isAuthenticated = true;
            this.authToken = response.body.Token;
            this.userID = response.body.UserID;
            this.saveToLocalStorage('token', this.authToken);
            this.saveToLocalStorage('userID', this.userID);
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
    this.authToken = undefined;
    this.userID = undefined;
  }

  isAuthenticatedUser(): boolean {
    // Return the authentication status
    return this.isAuthenticated;
  }

  getAuthToken(): string | undefined {
    // Return the authentication token
    return this.authToken;
  }

  getUserID(): string | undefined {

    return this.userID;
  }


  sendLoginData(email: string, password: string): Observable<HttpResponse<any>> {
    const url = 'http://localhost:3000/users/login';
    const body = new UserDTO();
    body.Email = email;
    body.Password = password;

    return this.http.post(url, body, { observe: 'response' });
  }


  sendSignupData(email: string, fName: string, lName: string, password: string) {
    const url = 'http://localhost:3000/users/signup';
    const body = new UserDTO();
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
