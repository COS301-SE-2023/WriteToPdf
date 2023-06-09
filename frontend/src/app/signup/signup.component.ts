import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {

  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  value: string = '';
  constructor(private router: Router, private elementRef: ElementRef, private userService: UserService) { }

  navigateToPage(pageName: string) {
    this.router.navigate([`/${pageName}`]);
  }
  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument
      .body.style.backgroundColor = '#ffffff';
  }

  signup() {
    if (this.userService.signup(this.username, this.email, this.password, this.confirmPassword)) {
      this.navigateToPage('home');
    } else {
      alert('Invalid credentials');
    }
  }

}
