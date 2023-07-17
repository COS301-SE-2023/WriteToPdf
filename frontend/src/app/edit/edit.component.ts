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
  quill: any;
  fileName: string | undefined = '';
  text: any;
  sidebarVisible: boolean = true;
  exportDialogVisible: boolean = false;
  public speedDialItems!: MenuItem[];
  public Editor = DecoupledEditor;
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
    let contents: string | undefined;
    //Waits a small amount of time to fetch content from editService.
    setTimeout(() => {contents = this.editService.getContent();}, 0);
    //Then, gets the actual content.
    const editableArea: HTMLElement = this.elementRef.nativeElement.querySelector('.document-editor__editable');
    console.log(editableArea.toString());
    const toolbarContainer: HTMLElement = this.elementRef.nativeElement.querySelector('.document-editor__toolbar');
    if (editableArea && toolbarContainer) {
      DecoupledEditor.create(editableArea, {
        cloudServices: {
          //TODO EXTREMELY useful for cloud collaboration.
        },
      })
        .then((editor) => {
          // Apply assertion for toolbarContainer
          (toolbarContainer as Node).appendChild(editor.ui.view.toolbar.element as Node);
          if(contents){
            editor.setData(contents);
            this.loadDocumentContents(editableArea);
          }
          (window as any).editor = editor; // Adding 'editor' to the global window object for testing purposes.
        })
        .catch((err) => {
          console.error(err);
        });
    }
    else {
      console.log("An error has occurred in either fetching, parsing or rendering the document.");
    }
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#E3E3E3';
    }

  navigateToPage(pageName: string) {
    this.router.navigate([`/${pageName}`]);
  }



  save() {
    // Save the document quill content to localStorage when changes occur
    const editableArea: HTMLElement = this.elementRef.nativeElement.querySelector('.document-editor__editable');
    let contents = editableArea.innerHTML;
    this.fileService.saveDocument(
      contents,
      this.editService.getMarkdownID(),
      this.editService.getPath()
    );
  }

  //TODO The below function currently has no use, but
  // it can be put to good use with the idea of the mini home page that I had - for file management inside the
  // doc editor.
  // I'll call this function on ngInit, rather. To load the doc on startup of the edit page.
  async loadDocumentContents(editArea: HTMLElement) {
    const contents = await this.fileService.retrieveDocument(
      this.editService.getMarkdownID(),
      this.editService.getPath()
    );
    if (contents) {
      editArea.innerHTML = contents;
    }
    console.log(contents);
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

  //TODO Take this functionality to Home Page.
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
    let placeHolder = "CKEditor goes here";
    let contents = "CKEditor contents";
    const markdownID = this.editService.getMarkdownID();
    const name = this.editService.getName();
    if (markdownID && name) {
     this.fileService.exportDocument(markdownID, name, contents, 'txt');
    }
  }
}
