import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { Inject } from '@angular/core';
import { environment } from 'src/environments/environment';

import { CredentialResponse, PromptMomentNotification } from 'google-one-tap';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  value: string = '';

  private clientId = environment.clientId;

  constructor(
    @Inject(Router) private router: Router,
    private elementRef: ElementRef,
    private userService: UserService
  ) {}

  navigateToPage(pageName: string) {
    this.router.navigate([`/${pageName}`]);
  }

  navigateToPageWithData(pageName: string) {
    const data = {
      Email: this.email,
      Password: this.password,
    };

    this.router.navigate([pageName], { state: data });
  }

  ngOnInit(): void {
    // @ts-ignore
    window.onGoogleLibraryLoad = () => {
      // @ts-ignore
      google.accounts.id.initialize({
        client_id: this.clientId,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });
      // @ts-ignore
      console.log(google.accounts.id.renderButton(
        // @ts-ignore
        document.getElementById("buttonDiv"),
        { theme: "outline", size: "large", width: "100%", shape: "pill" }
      ));
      // @ts-ignore
      google.accounts.id.prompt((notification: PromptMomentNotification) => { });
    };
  }

  async handleCredentialResponse(response: CredentialResponse) {
    if (await this.userService.loginWithGoogle(response.credential))
      this.navigateToPage('home');
  }

  loadGoogleSignInAPI(): void {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    // script.onload = () => {
    //   // Google Sign-In API loaded
    //   window.googleSignIn = this.googleSignIn;
    // };
    document.body.appendChild(script);
  }
  
  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#ffffff';
  }

  async signup() {
    if (
      await this.userService.signup(
        this.firstName,
        this.lastName,
        this.email,
        this.password,
        this.confirmPassword
      )
    ) {
      this.navigateToPageWithData('login');
    } else {
      alert('Invalid credentials');
    }
  }

  isFormValid(): boolean {
    return (
      this.isValidFirstName(this.firstName) &&
      this.isValidLastName(this.lastName) &&
      this.isValidEmail(this.email) &&
      this.isValidPassword(this.password) &&
      this.isValidConfirmPassword(this.confirmPassword)
    );
  }

  isValidFirstName(firstName: string): boolean {
    return (
      firstName.length > 0 &&
      firstName.length < 50 &&
      !!firstName.match(/^[a-zA-Z]+$/)
    );
  }

  isValidLastName(lastName: string): boolean {
    return (
      lastName.length > 0 &&
      lastName.length < 50 &&
      !!lastName.match(/^[a-zA-Z]+$/)
    );
  }

  isValidEmail(email: string): boolean {
    if (
      !email.match(
        /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$/
      )
    )
      return false;
    return true;
  }

  isValidPassword(password: string): boolean {
    if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/))
      return false;
    return true;
  }

  isValidConfirmPassword(confirmPassword: string): boolean {
    if (confirmPassword != this.password) return false;
    return true;
  }

  navigateToLogin() {
    this.router.navigate(['/login']).then(() => window.location.reload());
  }
}
