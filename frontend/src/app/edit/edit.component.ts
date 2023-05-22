import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';

import { EditApi } from './edit.api';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent
  implements AfterViewInit, OnInit
{
  documentContent: string = '';

  constructor(
    private elementRef: ElementRef,
    private api: EditApi,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // const savedContent = localStorage.getItem('document');
    // if (savedContent) {
    //   this.documentContent = savedContent;
    // }
    this.getLoremIpsum();
  }
  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#E3E3E3';
  }

  onContentChange(event: any) {
    // Save the document content to localStorage when changes occur
    const content = event.target.innerHTML;
    localStorage.setItem('document', content);
  }

  getLoremIpsum() {
    this.api.getLoremIpsum().subscribe(
      (response) => {
        this.documentContent = response.data;
      },
      (error) => {
        console.error(
          'Error fetching items:',
          error,
        );
      },
    );
  }

  navigateToPage(pageName: string) {
    this.router.navigate([`/${pageName}`]);
  }
}
