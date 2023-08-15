import { Component, ElementRef, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment';

import { CredentialResponse, PromptMomentNotification } from 'google-one-tap';

// import { HttpClient, HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  // popupWindow: Window | null = null;

  emailForgot: string = '';

  private clientId = environment.clientId;

  forgotPasswordPopup: boolean = false;
  constructor(
    @Inject(Router) private router: Router,
    private elementRef: ElementRef,
    private userService: UserService,
    @Inject(ActivatedRoute) private route: ActivatedRoute,
    private messageService: MessageService,
  ) { }
  ngOnInit(): void {
    const data = history.state;
    if (data) {
      this.email = data['Email'];
      this.password = data['Password'];
    }
    
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
      google.accounts.id.renderButton(
        // @ts-ignore
        document.getElementById("buttonDiv"),
        { theme: "outline", size: "large", width: "100%", shape: "pill" }
      );
      // @ts-ignore
      google.accounts.id.prompt((notification: PromptMomentNotification) => { });
    };
  }

  async handleCredentialResponse(response: CredentialResponse) {
    if(await this.userService.loginWithGoogle(response.credential))
      this.navigateToPage('home');
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
    if (!this.email || this.email === '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `Email field empty`,
      });
    } else if (!this.password || this.password === '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `Password field empty`,
      });
    } else {
      if (await this.userService.login(this.email, this.password)) {
        this.navigateToPage('home');
      }
    }
  }

  async autoLogin(): Promise<void> {

    this.email = environment.DEV_USER_EMAIL;
    this.password = environment.DEV_USER_PASSWORD;
    this.login();
  }

  forgotPassword(): void {
    //todo implement
    console.log('TODO: forgotPassword');
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

  navigateToSignup(): void {
    this.router.navigate(['/signup']).then(() => window.location.reload());
  }
}
