import { AfterViewInit, Component, ElementRef } from '@angular/core';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})

export class EditComponent implements AfterViewInit {

  constructor(private elementRef: ElementRef) { }
  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument
      .body.style.backgroundColor = '#E3E3E3';
  }

}