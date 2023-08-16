import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Inject } from '@angular/core';
import { environment } from 'src/environments/environment';
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

  constructor(
    @Inject(Router) private router: Router,
    private elementRef: ElementRef,
    private userService: UserService,
    @Inject(ActivatedRoute) private route: ActivatedRoute,
    private messageService: MessageService
  ) { }
  ngOnInit(): void {
    const data = history.state;
    if (data) {
      this.email = data['Email'];
      this.password = data['Password'];
    }
    this.loadGoogleSignInAPI();
    // this.setCrossOriginOpenerPolicyHeader();
// // Popup window tests
//     this.popupWindow = window.open('...', 'popupName', '...');
//     if (this.popupWindow) {
//       this.popupWindow.postMessage('Hello from parent window!', '*');
//       window.addEventListener('message', this.receiveMessage.bind(this));
//     }
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

  // setCrossOriginOpenerPolicyHeader(): void {
  //   const headers = new HttpHeaders({
  //     'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
  //   });
  // }

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

  // googleSignIn(): void {
  //   console.log('Google Sign-In completed.');
  //   // Additional logic for handling the sign-in result
  // }

  // // Part of popup window tests
  // receiveMessage(event: MessageEvent): void {
  //   // Make sure to verify the origin of the event to ensure security
  //   if (event.origin === 'http://your-popup-origin') {
  //     console.log('Message received from popup window:', event.data);
  //   }
  // }

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
}
