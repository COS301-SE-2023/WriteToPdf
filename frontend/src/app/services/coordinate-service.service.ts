import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CoordinateService {
  private elementAtCoordinate: HTMLElement | null = null;

  setElementAtCoordinate(element: HTMLElement) {
    this.elementAtCoordinate = element;
  }

  getElementAtCoordinate(): HTMLElement | null {
    return this.elementAtCoordinate;
  }
}
