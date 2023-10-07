import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {

  constructor(private elementRef: ElementRef, private router: Router) { }

  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#FFFFFF';
    this.elementRef.nativeElement.ownerDocument.body.style.margin = '0';
    this.elementRef.nativeElement.ownerDocument.body.style.height = '100svh';
  }

  setContent(contentNumber:number) {
    console.log(contentNumber);
    let content = document.getElementById('content');
    if(!content) return;
    if (contentNumber == 1) {
      content.style.gridTemplateColumns = "5fr 1fr 1fr";
    } else if (contentNumber == 2) {
      content.style.gridTemplateColumns = "1fr 5fr 1fr";
    } else if (contentNumber == 3) {
      content.style.gridTemplateColumns = "1fr 1fr 5fr";
    } 
  }

  navigateToSignup(): void {
    this.router.navigate(['/signup']).then(() => window.location.reload());
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']).then(() => window.location.reload());
  }
}
