import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserDTO } from './dto/user.dto';
import { RefreshTokenDTO } from './dto/refresh_token.dto';
import { SHA256 } from 'crypto-js';
import { hashSync, genSaltSync } from 'bcrypt-ts';
import { MessageService } from 'primeng/api';
import { PrimeIcons } from 'primeng/api';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private isAuthenticated: boolean = false;
  private authToken: string | undefined = undefined;
  private userID: number | undefined = undefined;
  private expiresAt: Date | undefined = undefined;
  private email: string | undefined = undefined;
  private firstName: string | undefined = undefined;
  private doExpirationCheck: boolean = false;
  private timer: any;
  private encryptionKey: string | undefined = undefined;

  constructor(private http: HttpClient, private messageService: MessageService, @Inject(Router) private router: Router) { }
  
  
  async login(email: string, password: string): Promise<boolean> {
    let salt: string;
    await this.retrieveSalt(email)
      .then((result) => {
        salt = result;
        // Continue with the code that depends on the salt value
      })
      .catch((error) => {
        console.error(error); // Handle error if any
      });

    return new Promise<boolean>(async (resolve, reject) => {
      this.sendLoginData(email, password, salt).subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.status === 200) {
            this.isAuthenticated = true;
            this.authToken = response.body.Token;
            this.userID = response.body.UserID;
            this.expiresAt = response.body.ExpiresAt;
            this.email = email;
            this.firstName = response.body.FirstName;
            this.doExpirationCheck = true;
            this.encryptionKey = response.body.EncryptionKey;
            this.startExpirationCheck();
            resolve(true);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Login failed`,
            });
            resolve(false);
          }
        },
        error: (error) => {
          console.error(error); // Handle error if any
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `${error.error.error}`,
          });
          resolve(false);
        },
      });
    });
  }

  async signup(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<boolean> {
    if (password !== confirmPassword) {
      return new Promise<boolean>((resolve, reject) => {
        resolve(false);
      });
    }
    if (
      firstName === '' ||
      lastName === '' ||
      email === '' ||
      password === '' ||
      confirmPassword === ''
    ) {
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
            resolve(true);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Signup failed`,
            });
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

  logout(): void {
    // Perform logout logic here (e.g., clear authentication token, reset flags)
    this.isAuthenticated = false;
    this.authToken = undefined;
    this.userID = undefined;
    this.email = undefined;
    this.firstName = undefined;
    this.expiresAt = undefined;
    this.doExpirationCheck = false;
    this.navigateToPage('/login');
    if(this.timer) {
      clearInterval(this.timer);
    }
  }

  isAuthenticatedUser(): boolean {
    // Return the authentication status
    return this.isAuthenticated;
  }

  getAuthToken(): string | undefined {
    // Return the authentication token
    return this.authToken;
  }

  getUserID(): number | undefined {
    return this.userID;
  }

  getEmail(): string | undefined {
    return this.email;
  }

  getFirstName(): string | undefined {
    return this.firstName;
  }

  getEncryptionKey(): string | undefined {
    return this.encryptionKey;
  }

  sendLoginData(email: string, password: string, salt: string): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}users/login`;
    const body = new UserDTO();
    body.Email = email;

    const hash = this.hashPassword(password, salt);
    body.Password = hash;

    return this.http.post(url, body, { observe: 'response' });
  }

  private generateRandomSalt() {
    const salt = genSaltSync(10);
    return salt;
  }


  sendSignupData(email: string, fName: string, lName: string, password: string): Observable<HttpResponse<any>> {
        const environmentURL = environment.apiURL;
    const url = `${environmentURL}users/signup`;

    const body = new UserDTO();
    body.FirstName = fName;
    body.LastName = lName;
    body.Email = email;
    const salt = this.generateRandomSalt();
    body.Salt = salt;
    const hash = this.hashPassword(password, salt);
    body.Password = hash;

    return this.http.post(url, body, { observe: 'response' });
  }

  async retrieveSalt(email: string): Promise<string> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}users/get_salt`;
    const body = new UserDTO();
    body.Email = email;

    return new Promise((resolve, reject) => {
      this.http.post(url, body, { observe: 'response' }).subscribe({
        next: (response: HttpResponse<any>) => {
          resolve(response.body.Salt);
        },
        error: (error) => {
          console.error(error); // Handle error if any
          reject(null);
        },
      });
    });
  }

  private startExpirationCheck() {
    const checkInterval = 30000;

    this.timer=setInterval(() => {
      this.checkExpiration();

    }, checkInterval);
  }

  private checkExpiration() {
    if (this.doExpirationCheck) {
      if (!this.expiresAt) {
        // Handle the case when expiresAt is undefined or falsy
        console.log('expiresAt is undefined or falsy.');
        return;
      }

      const expiresAtDate = new Date(this.expiresAt); // Assuming expiresAt is a string
      const currentDate = new Date();
      const notificationTime = new Date(expiresAtDate.getTime() - 60000); // Subtract 1 minute (60000 milliseconds) from the expiration time

      if (currentDate >= notificationTime && currentDate < expiresAtDate) {
        // Send the expiration notification
        console.log('Sending expiration notification...');
        this.sendRefreshTokenRequest().subscribe({
          next: (response: HttpResponse<any>) => {
            console.log(response);
            console.log(response.status);

            if (response.status === 200) {
              // console.log("Refresh token successful");
              this.authToken = response.body.Token;
              this.expiresAt = response.body.ExpiresAt;
            } else {
              // console.log("Refresh token failed");
            }
          },
          error: (error) => {
            console.error(error); // Handle error if any
          },
        });
      }
    }
  }

  sendRefreshTokenRequest(): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}auth/refresh_token`;
    const body = new RefreshTokenDTO();
    body.UserID = this.userID;
    body.Token = this.authToken;
    body.Email = this.email;
    body.ExpiresAt = this.expiresAt;

    console.log('Body: '+JSON.stringify(body));
    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.authToken
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  private hashPassword(password: string, salt: string): string {
    const hashed = hashSync(password, salt);

    return hashed;
  }

  navigateToPage(page: string): void {
    this.router.navigate([page]);
  }
}
