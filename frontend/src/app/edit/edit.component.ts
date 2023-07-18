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
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements AfterViewInit, OnInit {
  fileName: string | undefined = '';
  text: any;
  sidebarVisible: boolean = true;
  exportDialogVisible: boolean = false;
  public speedDialItems!: MenuItem[];
  public Editor = DecoupledEditor;
  public globalAreaReference!: HTMLElement;
  constructor(
    private elementRef: ElementRef,
    @Inject(Router) private router: Router,
    private dialogService: DialogService,
    private fileService: FileService,
    private editService: EditService,
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
    //Here is the code for the Decoupled editor initialization.

    //End of decoupled editor code.
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
    //Waits a small amount of time to fetch content from editService.
    let editableArea = this.elementRef.nativeElement.querySelector('.document-editor__editable');
    this.globalAreaReference = editableArea; //set to avoid constant referencing
    const toolbarContainer: HTMLElement = this.elementRef.nativeElement.querySelector('.document-editor__toolbar');
    if (editableArea && toolbarContainer) {
      DecoupledEditor.create(editableArea, {
        cloudServices: {
          //TODO Great for Collaboration features.
        },
      })
        .then((editor) => {
          // Apply assertion for toolbarContainer
          (toolbarContainer as Node).appendChild(editor.ui.view.toolbar.element as Node);
          (window as any).editor = editor; // Adding 'editor' to the global window object for testing purposes.
          // Set the saved content after the editor is ready
          editor.setData(<string>this.editService.getContent());
        })
        .catch((err) => {
          console.error(err);
        });
    }
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#E3E3E3';
    }

  navigateToPage(pageName: string) {
    this.router.navigate([`/${pageName}`]);
  }



  saveDocumentContents() {
    // Save the document quill content to localStorage when changes occur
    const editableArea: HTMLElement = this.elementRef.nativeElement.querySelector('.document-editor__editable');
    let contents = editableArea.innerHTML;
    console.log("Before function call save:" + contents);
    this.fileService.saveDocument(
      contents,
      this.editService.getMarkdownID(),
      this.editService.getPath()
    );
    console.log("After function call save:" + contents);
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

  renameDocument() {
    console.log('rename');
    this.fileService.renameDocument(
      this.editService.getMarkdownID(),
      this.fileName,
      this.editService.getPath()
    );
  }

  showDialog() {
    this.exportDialogVisible = true;
  }

  exportTextFile() {
    let contents = this.globalAreaReference.innerHTML;
    const markdownID = this.editService.getMarkdownID();
    const name = this.editService.getName();
    if (markdownID && name) {
     this.fileService.exportDocumentToTextFile(markdownID, name, contents, 'txt');
    }
  }
}
