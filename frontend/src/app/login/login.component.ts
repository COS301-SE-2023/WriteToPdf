import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  email: string = '';
  password: string = '';

  constructor(private router: Router, private elementRef: ElementRef, private userService: UserService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const data = history.state;
    if (data) {
      this.email = (data['Email']);
      this.password = (data['Password']);
    }
  }
  
  navigateToPage(pageName: string) {
    this.router.navigate([`/${pageName}`]);
  }
  ngAfterViewInit() {

    this.elementRef.nativeElement.ownerDocument
      .body.style.backgroundColor = '#ffffff';
  }

  async login(): Promise<void> {
    if (await this.userService.login(this.email, this.password)) {
      this.navigateToPage('home');
    } else {
      alert('Invalid credentials');
    }
  }

  async autoLogin(): Promise<void> {
    this.email="test";
    this.password="123456";
  }

}
