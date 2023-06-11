import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { LoginUserDTO } from './dto/login-user.dto';
import { CreateUserDTO } from './dto/create-user.dto';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private isAuthenticated: boolean = false;
  private authToken: string | null = null;

  constructor(private http: HttpClient) {}

  async login(email: string, password: string): Promise<boolean> {
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

  signup(
    firstName: string,
    lastName: string,
    email: String,
    password: string,
    confirmPassword: string
  ): boolean {
    // Perform validation checks
    if (
      firstName.trim() === '' ||
      lastName.trim() === '' ||
      email.trim() === '' ||
      password.trim() === '' ||
      password !== confirmPassword
    ) {
      return false; // Signup failed due to invalid inputs
    }

    // Perform the signup process (e.g., make an API call to register the user)

    // Assuming the signup process is successful
    this.isAuthenticated = true;
    this.authToken = 'sample-auth-token';
    return true;
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

  fetchData() {
    const url = 'localhost:3000';

    this.http.get(url).subscribe({
      next: (response) => {
        // Handle the response here
        console.log(response);
      },
      error: (error) => {
        // Handle error if any
        console.error(error);
      },
    });
  }

  sendLoginData(
    email: string,
    password: string
  ): Observable<HttpResponse<any>> {
    const url = 'http://localhost:3000/users/login';
    const body = new LoginUserDTO();
    body.Email = email;
    body.Password = password;

    return this.http.post(url, body, { observe: 'response' });
  }

  sendSignupData(
    email: string,
    fName: string,
    lName: string,
    password: string
  ) {
    const url = 'localhost:3000';
    const body = {
      Email: email,
      FirstName: fName,
      LastName: lName,
      Password: password,
    };

    this.http.post(url, body).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.error(error);
      },
    });
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
