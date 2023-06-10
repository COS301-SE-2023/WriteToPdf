import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private isAuthenticated: boolean = false;
  private authToken: string | null = null;

  constructor(private http: HttpClient) { }

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

  signup(firstName: string, lastName: string, email:String, password: string, confirmPassword: string): boolean {
    // Perform validation checks
    if (firstName.trim() === '' || lastName.trim() === '' || email.trim() === '' || password.trim() === '' || password !== confirmPassword) {
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
    const url = 'https://localhost:3000';

    this.http.get(url).subscribe({
      next: (response) => {
        // Handle the response here
        console.log(response);
      },
      error: (error) => {
        // Handle error if any
        console.error(error);
      }
    });
  }

  sendLoginData(email: string, password: string) {
    const url = 'https://localhost:3000';
    const body = {
       Email:  email,
       Password: password
    };

    this.http.post(url, body).subscribe({
      next: (response) => {
        // Handle the response here
        console.log(response);
      },
      error: (error) => {
        // Handle error if any
        console.error(error);
      }
    });
  }

  sendSignupData(email: string, fName:string, lName:string, password: string) {
    const url = 'https://localhost:3000';
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
      }
    });
  }

}
