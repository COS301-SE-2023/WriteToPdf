import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor(private router: Router, private elementRef: ElementRef) { }

  navigateToPage( pageName: string) {
    this.router.navigate([`/${pageName}`]);
  }
  ngAfterViewInit() {
      this.elementRef.nativeElement.ownerDocument
  .body.style.backgroundColor = '#ffffff';
  }

}
