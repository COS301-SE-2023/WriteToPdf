import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { FileUploadPopupComponent } from '../file-upload-popup/file-upload-popup.component';
import { DialogService } from 'primeng/dynamicdialog';
import { FileService } from '../services/file.service';
import { EditService } from '../services/edit.service';
import { Inject } from '@angular/core';
import Quill from "quill";

import {CKEditorModule} from "@ckeditor/ckeditor5-angular";
import {CKEditorComponent} from "@ckeditor/ckeditor5-angular";
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import * as CKE from '@ckeditor/ckeditor5-build-classic';
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements AfterViewInit, OnInit {
  quill: any;
  documentContent: string | undefined = '';
  fileName: string | undefined = '';
  text: any;
  bold: boolean = false;
  sidebarVisible: boolean = true;
  exportDialogVisible: boolean = false;
  public speedDialItems!: MenuItem[];
  public Editor? = ClassicEditor;
  public editorContent = '';
  public editorConfig = {
    plugins: [ 'Image' ],
    toolbar: [ 'imageUpload', '|', 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote' ],
    // Additional configuration options for the editor
  };
  constructor(
    private elementRef: ElementRef,
    @Inject(Router) private router: Router,
    private dialogService: DialogService,
    private fileService: FileService,
    private editService: EditService
  ) {}

  showFileUploadPopup(): void {
    const ref = this.dialogService.open(FileUploadPopupComponent, {
      header: 'Upload Files',
      showHeader: true,
      closable: true,
      closeOnEscape: true,
      dismissableMask: true,
    });
  }

  ngOnInit(): void {
    this.hideSideBar();
    this.speedDialItems = [
      {
        icon: 'pi pi-pencil',
        command: () => {
          this.navigateToPage('edit');
        },
      },
      {
        icon: 'pi pi-refresh',
        command: () => {
          // this.messageService.add({ severity: 'success', summary: 'Update', detail: 'Data Updated' });
        },
      },
      {
        icon: 'pi pi-trash',
        command: () => {
          // this.messageService.add({ severity: 'error', summary: 'Delete', detail: 'Data Deleted' });
        },
      },
      {
        icon: 'pi pi-upload',
        command: () => {
          this.showFileUploadPopup();
        },
      },
      {
        icon: 'pi pi-external-link',
      },
    ];
    this.fileName = this.editService.getName();
  }


  ngAfterViewInit() {
    const quill = this.quillEditor.getQuill();
    setTimeout(() => {
      const htmlContent = '<table><tr><th>Header 1</th><th>Header 2</th></tr><tr><td>Cell 1</td><td>Cell 2</td></tr></table>';
      quill.clipboard.dangerouslyPasteHTML(htmlContent);
      //Why wait 0ms? I don't know but it works
      const contents = this.editService.getContent();
      this.documentContent = contents;
      if (contents) {
        quill.setContents(JSON.parse(contents));
      }
    }, 0);
    quill.focus();
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#E3E3E3';
  }

  navigateToPage(pageName: string) {
    this.router.navigate([`/${pageName}`]);
  }

  extractDeltaJson() {
    const quill = this.quillEditor.getQuill();

    console.log(quill.getContents());
    console.log(quill.getFormat());
  }

  save() {
    // Save the document quill content to localStorage when changes occur
    const quill = this.quill.getQuill();
    const contents = quill.getContents();

    this.fileService.saveDocument(
      contents,
      this.editService.getMarkdownID(),
      this.editService.getPath()
    );
  }

  async load() {
    // Load the document quill content from localStorage when changes occur
    const quill = this.quill.getQuill();

    const contents = await this.fileService.retrieveDocument(
      this.editService.getMarkdownID(),
      this.editService.getPath()
    );
    if (contents) {
      quill.setContents(JSON.parse(contents));
    }
    console.log(contents);
  }

  undo() {
    const quill = this.quill.getQuill();
    const history = quill.history;

    if (history.stack.undo.length > 1) {
      history.undo();
    }
  }

  redo() {
    const quill = this.quill.getQuill();
    quill.history.redo();
  }

  hideSideBar() {
    // get asset sidebar and set display none
    const sidebar = document.getElementsByClassName('assetSidebar')[0];
    if (sidebar) {
      if (this.sidebarVisible) {
        sidebar.setAttribute('style', 'display:none');
        this.sidebarVisible = false;
      } else {
        sidebar.setAttribute('style', 'display:block');
        this.sidebarVisible = true;
      }
    }
  }

  rename() {
    console.log('rename');
    this.fileService.renameDocument(
      this.editService.getMarkdownID(),
      this.fileName,
      this.editService.getPath()
    );
  }

  async delete() {
    console.log('delete');
    await this.fileService.deleteDocument(this.editService.getMarkdownID());

    this.editService.setMarkdownID('');
    this.editService.setPath('');
    this.editService.setName('');
    this.editService.setContent('');
    this.editService.setParentFolderID('');

    this.navigateToPage('home');
  }

  showDialog() {
    this.exportDialogVisible = true;
  }

  exportFile() {
    const quill = this.quill;
    const contents = quill.getContents();

    const markdownID = this.editService.getMarkdownID();
    const name = this.editService.getName();

    if (markdownID && name) {
      this.fileService.exportDocument(markdownID, name, contents, 'txt');
    }
  }
}
