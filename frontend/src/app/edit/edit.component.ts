import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';

import { EditApi } from './edit.api';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})


export class EditComponent
  implements AfterViewInit, OnInit
{
  documentContent: string = '';
  text: string = 'HELLO WORDLS';

  cities: any[] = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
  ]
  constructor(
    private elementRef: ElementRef,
    private api: EditApi,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const savedContent = localStorage.getItem('document');
    if (savedContent) {
      this.text = savedContent;
    }
    this.getLoremIpsum();
  }
  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#E3E3E3';
  }

  onContentChange(event: any) {
    // Save the document content to localStorage when changes occur
    const content = this.text;
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

  outputText() {
    console.log(this.text);
  }


}

