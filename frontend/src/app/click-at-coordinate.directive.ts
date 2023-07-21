import { Directive, HostListener, ElementRef } from '@angular/core';
import { CoordinateService } from './services/coordinate-service.service';

@Directive({
  selector: '[appClickAtCoordinate]',
})
export class ClickAtCoordinateDirective {
  constructor(
    private elementRef: ElementRef,
    private coordinateService: CoordinateService
  ) {}

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const x = event.clientX;
    const y = event.clientY;
    const targetElement = document.elementFromPoint(x, y) as HTMLElement;

    // Store the element at the coordinate in the service
    this.coordinateService.setElementAtCoordinate(targetElement);
  }
}
