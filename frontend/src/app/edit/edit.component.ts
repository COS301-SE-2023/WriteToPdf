import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';

import { EditApi } from './edit.api';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})


export class EditComponent implements AfterViewInit, OnInit {

  @ViewChild('quillEditor') quillEditor: any;
  documentContent: string = '';
  text: any;
  bold: boolean = false;

  constructor(
    private elementRef: ElementRef,
    private api: EditApi,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const savedContent = localStorage.getItem('document');
    if (savedContent) {
      this.text = savedContent;
    }
    this.getLoremIpsum();
  }
  ngAfterViewInit() {
    const quill = this.quillEditor.getQuill();
    quill.focus();

    quill.on('selection-change', (range: any, oldRange: any, source: any) => {
      if (range) {
        if (range.length == 0) {
          this.setBold(quill.getFormat().bold);
        } else {
          var text = quill.getText(range.index, range.length);
          console.log('User has highlighted', text);
        }
      } else {
        console.log('Cursor not in the editor');
      }
    });

    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#E3E3E3';
  }

  onContentChange(event: any) {
    // Save the document content to localStorage when changes occur
    const content = this.text;
    localStorage.setItem('document', content);
  }

  getLoremIpsum() {
    this.api.getLoremIpsum().subscribe({
      next: (response) => {
        this.documentContent = response.data;
      },
      error: (error) => {
        console.error(
          'Error fetching items:',
          error,
        );
        this.documentContent =
          'Lorem Ipsum from app';
      },
    });
  }

  navigateToPage(pageName: string) {
    this.router.navigate([`/${pageName}`]);
  }

  extractDeltaJson() {
    const quill = this.quillEditor.getQuill();

    console.log(quill.getContents());
    console.log(quill.getFormat());
  }

  flipBold() {
    const quill = this.quillEditor.getQuill();
    const bold = document.getElementById('bold');
    if (this.bold) {
      this.bold = false;
      if (bold)
        bold.style.backgroundColor = '#E3E3E300';
      quill.format('bold', false);
    }
    else {
      quill.format('bold', true);
      this.bold = true;
      if (bold)
        bold.style.backgroundColor = '#E3E0E0';
    }
  }

  setBold(isBold:boolean) {
    const quill = this.quillEditor.getQuill();
    const bold = document.getElementById('bold');
    if (this.bold) {
      this.bold = false;
      if (bold)
        bold.style.backgroundColor = '#E3E3E300';
      quill.format('bold', false);
    }
    else {
      quill.format('bold', true);
      this.bold = true;
      if (bold)
        bold.style.backgroundColor = '#E3E0E0';
    }
  }



}

