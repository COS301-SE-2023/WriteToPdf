import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})

export class EditComponent implements AfterViewInit, OnInit {

  documentContent: string = '';

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    const savedContent = localStorage.getItem('document');
    if (savedContent) {
      this.documentContent = savedContent;
    }
  }
  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument
      .body.style.backgroundColor = '#E3E3E3';
  }

  onContentChange(event: any) {
    // Save the document content to localStorage when changes occur
    const content = event.target.innerHTML;
    localStorage.setItem('document', content);
  }




}