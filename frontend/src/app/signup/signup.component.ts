import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { Inject } from '@angular/core';
import { is } from 'cypress/types/bluebird';

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

  outputForm() {
    console.log(this.firstName);
    console.log(this.lastName);
    console.log(this.email);
    console.log(this.password);
    console.log(this.confirmPassword);
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
    // (document.getElementsByClassName('backgroundImage')[0] as HTMLElement).style.backgroundImage = 'radial-gradient(at ' + mouseXpercentage + '% ' + mouseYpercentage + '%, rgb(100 100 100 / 70%), rgb(0 0 0 / 70%), rgb(0 0 0 / 70%)), url(/assets/MockData/BGIW.jpg)';

  }
}
