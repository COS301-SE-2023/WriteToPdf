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

  navigateToSignup(): void {
    this.router.navigate(['/signup']).then(() => window.location.reload());
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']).then(() => window.location.reload());
  }

  // scrollToSection(section: string): void {
  //   const element = document.querySelector('#' + section);
  //   element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // }

  scrollToSection(section: string): void {
    var targetSection = document.getElementById(section);
    var offset = 200; // Adjust this value as needed

    if (targetSection) {
      const top = targetSection.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: top - offset,
        behavior: 'smooth'
      });
    }
  }

}
