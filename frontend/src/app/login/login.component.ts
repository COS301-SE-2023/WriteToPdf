import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  username: string = '';
  password: string = '';

  constructor(private router: Router, private elementRef: ElementRef, private userService: UserService) { }

  navigateToPage( pageName: string) {
    this.router.navigate([`/${pageName}`]);
  }
  ngAfterViewInit() {
      this.elementRef.nativeElement.ownerDocument
  .body.style.backgroundColor = '#ffffff';
  }

  login(): void {
    if (this.userService.login(this.username, this.password)) {
      this.navigateToPage('home');
    } else {
      alert('Invalid credentials');
    }
  }

}
