import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserDTO } from './dto/user.dto';
import { RefreshTokenDTO } from './dto/refresh_token.dto';
import * as CryptoJS from 'crypto-js';
import { hashSync, genSaltSync } from 'bcrypt-ts';
import { MessageService } from 'primeng/api';
import { PrimeIcons } from 'primeng/api';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Inject } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { set } from 'cypress/types/lodash';
import { ResetPasswordRequestDTO } from './dto/reset_password_request.dto';

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

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    @Inject(Router) private router: Router,
    private jwtHelper: JwtHelperService,
    private _ngZone: NgZone
  ) {}

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
            //TODO this needs to change to read from token payload
            this.isAuthenticated = true;
            this.authToken = response.body.Token;
            this.userID = response.body.UserID;
            this.expiresAt = this.jwtHelper.decodeToken(
              response.body.Token
            ).ExpiresAt;
            this.email = email;
            this.firstName = response.body.FirstName;
            this.doExpirationCheck = true;
            this.encryptionKey = response.body.EncryptionKey;
            if (
              this.authToken &&
              this.userID &&
              this.expiresAt &&
              this.email &&
              this.firstName &&
              this.encryptionKey
            ) {
              localStorage.setItem('isAuthenticated', 'true');
              localStorage.setItem('authToken', this.authToken);
              localStorage.setItem('userID', this.userID.toString());
              localStorage.setItem('expiresAt', this.expiresAt.toString());
              localStorage.setItem('email', this.email);
              localStorage.setItem('firstName', this.firstName);
              localStorage.setItem('encryptionKey', this.encryptionKey);
            }

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
    this._ngZone.run(() => {
      this.revokeToken().subscribe({
        next: (x: any) => {},
      });
    });

    if (this.timer) {
      clearInterval(this.timer);
    }
    this.isAuthenticated = false;
    this.authToken = undefined;
    this.userID = undefined;
    this.email = undefined;
    this.firstName = undefined;
    this.expiresAt = undefined;
    this.doExpirationCheck = false;

    localStorage.clear();

    this.router.navigate(['/login']).then(() => window.location.reload());
  }

  revokeToken(): Observable<any> {
    // return this.http.delete(this.path + "RevokeToken/" + this.username.value, { headers: header, withCredentials: true });

    const environmentURL = environment.apiURL;
    const url = `${environmentURL}users/revoke_token`;
    const body = new UserDTO();
    body.UserID = this.userID;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  async forgotPassword(email: string, newPassword: string) {
    const salt = await this.retrieveSalt(email);
    this.sendForgotPasswordData(
      email,
      this.hashPassword(newPassword, salt)
    ).subscribe({
      next: (response: HttpResponse<any>) => {
        // console.log('forgotPass response: ', response);
        if (response.status === 200) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Password changed successfully`,
          });
          this.navigateToPage('/login');
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Password change failed`,
          });
        }
      },
      error: (error) => {
        console.error(error); // Handle error if any
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `${error.error.error}`,
        });
      },
    });
  }

  sendForgotPasswordData(
    email: string,
    password: string
  ): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}users/reset_password`;
    const body = new UserDTO();
    body.Email = email;
    body.Password = password;
    return this.http.post(url, body, { observe: 'response' });
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

  setEncryptionKey(encryptionKey: string): void {
    this.encryptionKey = encryptionKey;
  }

  setFirstName(firstName: string): void {
    this.firstName = firstName;
  }

  setUserID(userID: number): void {
    this.userID = userID;
  }

  setEmail(email: string): void {
    this.email = email;
  }

  setAuthToken(authToken: string): void {
    this.authToken = authToken;
  }

  setAuthenticated(isAuthenticated: boolean): void {
    this.isAuthenticated = isAuthenticated;
  }

  setExpiresAt(expiresAt: Date): void {
    this.expiresAt = expiresAt;
  }

  sendLoginData(
    email: string,
    password: string,
    salt: string
  ): Observable<HttpResponse<any>> {
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

  sendSignupData(
    email: string,
    fName: string,
    lName: string,
    password: string
  ): Observable<HttpResponse<any>> {
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

  passwordResetRequest(email: string): void {
    this.sendPasswordResetRequest(email).subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.status === 200) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Password reset request sent`,
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Password reset request failed`,
          });
        }
      },
      error: (error) => {
        console.error(error); // Handle error if any
      },
    });
  }

  sendPasswordResetRequest(email: string): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}users/request_reset_password`;
    const body = new UserDTO();
    body.Email = email;

    return this.http.post(url, body, { observe: 'response' });
  }

  async resetPassword(token: string, password: string): Promise<boolean> {
    let salt: string;
    
    const email = this.jwtHelper.decodeToken(token).Email;
    await this.retrieveSalt(email)
      .then((result) => {
        salt = result;
        // Continue with the code that depends on the salt value
      })
      .catch((error) => {
        console.error(error); // Handle error if any
      });

    return new Promise<boolean>(async (resolve, reject) => {
      this.sendPasswordResetData(token, password, salt).subscribe({
        next: (response: HttpResponse<any>) => {
          console.log(response);
          if (response.status === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `Password reset successful`,
            });
            resolve(true);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Password reset failed`,
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

  sendPasswordResetData(
    token: string,
    password: string,
    salt: string
  ): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}users/reset_password`;
    const body = new ResetPasswordRequestDTO();
    body.Token = token;
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

  public restartTimer() {
    this.doExpirationCheck = true;
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.startExpirationCheck();
  }

  private startExpirationCheck() {
    const checkInterval = 30000;

    this.timer = setInterval(() => {
      this.checkExpiration();
    }, checkInterval);
  }

  private checkExpiration() {
    if (this.doExpirationCheck) {
      if (!this.expiresAt) {
        // Handle the case when expiresAt is undefined or falsy
        return;
      }

      const expiresAtDate = new Date(this.expiresAt); // Assuming expiresAt is a string
      const currentDate = new Date();
      const notificationTime = new Date(expiresAtDate.getTime() - 60000); // Subtract 1 minute (60000 milliseconds) from the expiration time

      if (currentDate >= notificationTime && currentDate < expiresAtDate) {
        // Send the expiration notification
        this.sendRefreshTokenRequest().subscribe({
          next: (response: HttpResponse<any>) => {
            if (response.status === 200) {
              // console.log(response);
              this.authToken = response.body.Token;
              this.expiresAt = this.jwtHelper.decodeToken(
                response.body.Token
              ).ExpiresAt;

              if (this.authToken && this.expiresAt) {
                localStorage.setItem('authToken', this.authToken);
                localStorage.setItem('expiresAt', this.expiresAt.toString());
              }
            } else {
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
    //TODO change here since RefreshDTO is changed
    body.UserID = this.userID;
    body.Token = this.authToken;
    body.Email = this.email;
    body.ExpiresAt = this.expiresAt;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.authToken
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  loginWithGoogle(credential: any): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      this.sendGoogleLoginData(credential).subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.status === 200) {
            //TODO this needs to change to read from token payload
            this.isAuthenticated = true;
            this.authToken = response.body.Token;
            this.userID = response.body.UserID;
            this.expiresAt = this.jwtHelper.decodeToken(
              response.body.Token
            ).ExpiresAt;
            this.email = response.body.Email;
            this.firstName = response.body.FirstName;
            this.doExpirationCheck = true;
            this.encryptionKey = response.body.EncryptionKey;
            if (
              this.authToken &&
              this.userID &&
              this.expiresAt &&
              this.email &&
              this.firstName &&
              this.encryptionKey
            ) {
              localStorage.setItem('isAuthenticated', 'true');
              localStorage.setItem('authToken', this.authToken);
              localStorage.setItem('userID', this.userID.toString());
              localStorage.setItem('expiresAt', this.expiresAt.toString());
              localStorage.setItem('email', this.email);
              localStorage.setItem('firstName', this.firstName);
              localStorage.setItem('encryptionKey', this.encryptionKey);
            }

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
          resolve(false);
        },
      });
    });
  }

  sendGoogleLoginData(credentials: any): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}users/google_signin`;
    const body: any = {};
    body.credential = credentials;

    return this.http.post(url, body, { observe: 'response' });
  }

  private hashPassword(password: string, salt: string): string {
    const hashed = hashSync(password, salt);

    return hashed;
  }

  navigateToPage(page: string): void {
    this.router.navigate([page]);
  }
}
