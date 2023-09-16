import { Component, ElementRef, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment';

import { CredentialResponse, PromptMomentNotification } from 'google-one-tap';
import { VersionControlService } from '../services/version.control.service';

// import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  emailForgot: string = '';

  newPass: string = '';
  confirmNewPass: string = '';

  private clientId = environment.clientId;

  forgotPasswordPopup: boolean = false;
  resetPasswordPopup: boolean = false;
  token: string = '';
  constructor(
    @Inject(Router) private router: Router,
    private elementRef: ElementRef,
    private userService: UserService,
    @Inject(ActivatedRoute) private route: ActivatedRoute,
    private messageService: MessageService,
    private versionControlService: VersionControlService
  ) {}
  ngOnInit(): void {
    const data = history.state;
    if (data) {
      this.email = data['Email'];
      this.password = data['Password'];
    }

    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      this.token = token;
      this.resetPasswordPopup = true;
    } else {
      // The token attribute was not passed in the URL
    }

    // @ts-ignore
    window.onGoogleLibraryLoad = () => {
      // @ts-ignore
      google.accounts.id.initialize({
        client_id: this.clientId,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      // @ts-ignore
      google.accounts.id.renderButton(
        // @ts-ignore
        document.getElementById('buttonDiv'),
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
          height: '4svh',
          shape: 'pill',
        }
      );
      // @ts-ignore
      google.accounts.id.prompt((notification: PromptMomentNotification) => {});
    };
  }

  async handleCredentialResponse(response: CredentialResponse) {
    if (await this.userService.loginWithGoogle(response.credential))
      this.router.navigate([`/home`]).then(() => window.location.reload());
    // this.navigateToPage('home');
  }

  navigateToPage(pageName: string) {
    this.router.navigate([`/${pageName}`]);
  }
  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#FFFFFF';
    this.elementRef.nativeElement.ownerDocument.body.style.margin = '0';
  }

  async login(): Promise<void> {
    // if (!this.email || this.email === '') {
    //   this.messageService.add({
    //     severity: 'error',
    //     summary: 'Error',
    //     detail: `Email field empty`,
    //   });
    // } else if (!this.password || this.password === '') {
    //   this.messageService.add({
    //     severity: 'error',
    //     summary: 'Error',
    //     detail: `Password field empty`,
    //   });
    // } else {
    //   if (await this.userService.login(this.email, this.password)) {
    //     this.navigateToPage('home');
    //   }
    // }

    this.versionControlService.init();
  }

  async autoLogin(): Promise<void> {
    this.email = environment.DEV_USER_EMAIL;
    this.password = environment.DEV_USER_PASSWORD;
    this.login();
  }

  async forgotPassword(): Promise<void> {
    await this.userService.passwordResetRequest(this.emailForgot);

    this.forgotPasswordPopup = false;
  }

  async resetPassword() {
    if (
      !this.newPass ||
      this.newPass === '' ||
      !this.confirmNewPass ||
      this.confirmNewPass === ''
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `One or more fields empty`,
      });
      return;
    }
    if (!this.isValidPassword(this.newPass)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number`,
      });
      return;
    }
    if (this.newPass !== this.confirmNewPass) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `Passwords do not match`,
      });
      return;
    }
    if (await this.userService.resetPassword(this.token, this.newPass)) {
      this.resetPasswordPopup = false;
    }
  }

  movemouse(event: MouseEvent) {
    // const windowWidth = window.innerWidth;
    // const windowHeight = window.innerHeight;
    // if (!windowWidth || !windowHeight) return;
    // const diffX = -1 * ((event.pageX - windowWidth / 2) / 1.5) / windowWidth;
    // const diffY = -1 * ((event.pageY - windowHeight / 2) / 1.5) / windowHeight;
    // const mouseXpercentage = Math.round((event.pageX / windowWidth + diffX) * 100);
    // const mouseYpercentage = Math.round((event.pageY / windowHeight + diffY) * 100);
    // // const mouseXpercentage = Math.round(event.pageX / windowWidth * 100);
    // // const mouseYpercentage = Math.round(event.pageY / windowHeight * 100);
    // // (document.getElementsByClassName('backgroundImage')[0] as HTMLElement).style.backgroundImage= 'radial-gradient(at ' + mouseXpercentage + '% ' + mouseYpercentage + '%, #3498db, #9b59b6)';
    // (document.getElementsByClassName('backgroundImage')[0] as HTMLElement).style.backgroundImage =
    // 'radial-gradient(at ' + mouseXpercentage + '% ' + mouseYpercentage + '%, rgb(100 100 100 / 70%), rgb(100 100 100 / 70%)), url(/assets/MockData/BGIW.jpg)';
    // console.log('radial-gradient(at ' + mouseXpercentage + '% ' + mouseYpercentage + '%, rgb(100 100 100 / 70%), rgb(100 100 100 / 70%)), url(/assets/MockData/BGIW.jpg)');
  }

  isValidPassword(password: string): boolean {
    if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/))
      return false;
    return true;
  }

  navigateToSignup(): void {
    this.router.navigate(['/signup']).then(() => window.location.reload());
  }
}
