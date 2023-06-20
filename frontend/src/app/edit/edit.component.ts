import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { DocumentService } from '../services/document.service';
import { EditService } from '../services/edit.service';
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})


export class EditComponent implements AfterViewInit, OnInit {

  @ViewChild('quillEditor') quillEditor: any;
  documentContent: string = '';
  fileName: string = '';
  text: any;
  bold: boolean = false;

  constructor(
    private elementRef: ElementRef,
    private router: Router,
    private documentService: DocumentService,
    private editService: EditService,
  ) { }

  ngOnInit(): void {
    this.fileName = this.editService.getName();
  }
  ngAfterViewInit() {
    const quill = this.quillEditor.getQuill();
    quill.focus();

    // quill.on('selection-change', (range: any, oldRange: any, source: any) => {
    //   if (range) {
    //     if (range.length == 0) {
    //       this.setBold(quill.getFormat().bold);
    //     } else {
    //       var text = quill.getText(range.index, range.length);
    //       console.log('User has highlighted', text);
    //     }
    //   } else {
    //     console.log('Cursor not in the editor');
    //   }
    // });

    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#E3E3E3';
  }

  onContentChange(event: any) {
    // Save the document content to localStorage when changes occur
    const content = this.text;
    localStorage.setItem('document', content);
  }

  navigateToPage(pageName: string) {
    this.router.navigate([`/${pageName}`]);
  }

  extractDeltaJson() {
    const quill = this.quillEditor.getQuill();

    console.log(quill.getContents());
    console.log(quill.getFormat());
  }

  // flipBold() {
  //   const quill = this.quillEditor.getQuill();
  //   const bold = document.getElementById('bold');
  //   if (this.bold) {
  //     this.bold = false;
  //     if (bold)
  //       bold.style.backgroundColor = '#E3E3E300';
  //     quill.format('bold', false);
  //   }
  //   else {
  //     quill.format('bold', true);
  //     this.bold = true;
  //     if (bold)
  //       bold.style.backgroundColor = '#E3E0E0';
  //   }
  // }

  // setBold(isBold:boolean) {
  //   const quill = this.quillEditor.getQuill();
  //   const bold = document.getElementById('bold');
  //   if (this.bold) {
  //     this.bold = false;
  //     if (bold)
  //       bold.style.backgroundColor = '#E3E3E300';
  //     quill.format('bold', false);
  //   }
  //   else {
  //     quill.format('bold', true);
  //     this.bold = true;
  //     if (bold)
  //       bold.style.backgroundColor = '#E3E0E0';
  //   }
  // }

  save()
  {
    // Save the document quill content to localStorage when changes occur
    const quill= this.quillEditor.getQuill();
    const contents=quill.getContents();

    localStorage.setItem('document', JSON.stringify(contents));

    console.log(contents);
  }

  load()
  {
    // Load the document quill content from localStorage when changes occur
    const quill= this.quillEditor.getQuill();
    const contents=localStorage.getItem('document');
    if(contents)
    {
      quill.setContents(JSON.parse(contents));
    }
    console.log(contents);
  }

  undo()
  {
    const quill = this.quillEditor.getQuill();
    const history = quill.history;

    if (history.stack.undo.length > 1) {
      history.undo();
    }
  }

  redo()
  {
    const quill= this.quillEditor.getQuill();
    quill.history.redo();
  } 

  rename()
  {
    this.documentService.renameDocument(this.fileName);
  }
}

