import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Inject } from '@angular/core';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  constructor(@Inject(Router) private router: Router, private elementRef: ElementRef, private userService: UserService, @Inject(ActivatedRoute) private route: ActivatedRoute, private messageService: MessageService) { }
  ngOnInit(): void {
    const data = history.state;
    if (data) {
      this.email = data['Email'];
      this.password = data['Password'];
    }
  }

  navigateToPage(pageName: string) {
    this.router.navigate([`/${pageName}`]);
  }
  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#ffffff';
  }

  async login(): Promise<void> {
    if (this.email === '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `Email field empty`,
      });
    } else if (this.password === '') {
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
    this.email = 'test';
    this.password = '123456';
  }
}
