import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { FileUploadPopupComponent } from '../file-upload-popup/file-upload-popup.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { DialogService } from 'primeng/dynamicdialog';
import { FileService } from '../services/file.service';
import { EditService } from '../services/edit.service';
import { AssetService } from '../services/asset.service';
import { Inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { set } from 'cypress/types/lodash';
import { PageBreak } from '@ckeditor/ckeditor5-page-break';

import html2pdf from 'html2pdf.js/dist/html2pdf';

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
  currentZoom: number = 1;
  exportDialogVisible: boolean = false;
  public speedDialItems!: MenuItem[];
  assets: any[] = [];

  public editor: DecoupledEditor = {} as DecoupledEditor;
  public globalAreaReference!: HTMLElement;
  constructor(
    private elementRef: ElementRef,
    @Inject(Router) private router: Router,
    private dialogService: DialogService,
    private fileService: FileService,
    private editService: EditService,
    private assetService: AssetService,
    private clipboard: Clipboard,
    private messageService: MessageService
  ) { }

  showFileUploadPopup(): void {
    const ref = this.dialogService.open(FileUploadPopupComponent, {
      header: 'Upload Files',
      showHeader: true,
      closable: true,
      closeOnEscape: true,
      dismissableMask: true,
    });
  }

  async ngOnInit(): Promise<void> {
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
    let editableArea = this.elementRef.nativeElement.querySelector(
      '.document-editor__editable'
    );
    this.globalAreaReference = editableArea; //set to avoid constant referencing
    const toolbarContainer: HTMLElement =
      this.elementRef.nativeElement.querySelector('.document-editor__toolbar');
    if (editableArea && toolbarContainer) {
      DecoupledEditor.create(editableArea, {
        toolbar: {
          shouldNotGroupWhenFull: false,
        },
        cloudServices: {
          //TODO Great for Collaboration features.
        },
        // plugins: [PageBreak],
        link: {
          // Automatically add target="_blank" and rel="noopener noreferrer" to all external links.
          addTargetToExternalLinks: true,
        },
      })
        .then((editor) => {
          // Apply assertion for toolbarContainer
          // (toolbarContainer as Node).appendChild(editor.ui.view.toolbar.element as Node);
          editor.ui.view.toolbar.element?.style.setProperty(
            'background',
            '#00000000'
          );
          editor.ui.view.toolbar.element?.style.setProperty('border', 'none');
          editor.ui.view.toolbar.element?.style.setProperty(
            'width',
            'calc(100vw - 300px)'
          );
          editor.ui.view.toolbar.element?.style.setProperty(
            'overflow-x',
            'hidden !important'
          );

          document
            .getElementsByClassName('toolsWrapper')[0]
            .appendChild(editor.ui.view.toolbar.element as Node);
          (window as any).editor = editor; // Adding 'editor' to the global window object for testing purposes.
          // Set the saved content after the editor is ready
          editor.setData(<string>this.editService.getContent());
          console.log(<string>this.editService.getContent());
          this.editor = editor;
        })
        .catch((err) => {
          console.error(err);
        });
    }
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#E3E3E3';
    this.elementRef.nativeElement.ownerDocument.body.style.overflow = 'hidden';
    this.refreshSidebar();
  }

  navigateToPage(pageName: string) {
    this.router.navigate([`/${pageName}`]);
  }

  navigateToCameraPage() {
    const data = {
      ParentFolderId: this.editService.getParentFolderID(),
      Path: this.editService.getPath(),
    };
    console.log('On move to cam page: ' + this.editService.getParentFolderID());
    this.router.navigate(['/camera'], { state: data });
  }

  saveDocumentContents() {
    // Save the document quill content to localStorage when changes occur
    // const editableArea: HTMLElement = this.elementRef.nativeElement.querySelector('.document-editor__editable');
    let contents = this.editor.getData();
    console.log('Before function call save:' + contents);
    this.fileService.saveDocument(
      contents,
      this.editService.getMarkdownID(),
      this.editService.getPath()
    );
    console.log('After function call save:' + contents);
  }

  hideSideBar() {
    // get asset sidebar and set display none
    const sidebar = document.getElementsByClassName('assetSidebar')[0];
    const editor = document.getElementsByClassName('editor')[0];
    const showAssetSidebar =
      document.getElementsByClassName('showAssetSidebar')[0];
    if (sidebar && editor && showAssetSidebar) {
      if (this.sidebarVisible) {
        //then hide the sidebar
        console.log('hide');
        editor.setAttribute('style', 'left:0px;width:100%;margin:auto;');
        sidebar.setAttribute('style', 'display:none');
        showAssetSidebar.setAttribute('style', 'display:block');
        this.sidebarVisible = false;
      } else {
        //then show the sidebar

        editor.setAttribute('style', 'padding-right: 0px;left:260px');
        sidebar.setAttribute('style', 'display:block');
        showAssetSidebar.setAttribute('style', 'display:none');
        this.sidebarVisible = true;
      }
    }

    this.reCenterPage();
  }

  renameDocument() {
    console.log('rename');
    this.fileService
      .renameDocument(
        this.editService.getMarkdownID(),
        this.fileName,
        this.editService.getPath()
      )
      .then((Boolean) => {
        if (Boolean) {
          this.editService.setName(this.fileName);
        }
      });
  }

  showDialog() {
    this.exportDialogVisible = true;
  }

  async retrieveAsset(assetId: string, format: string) {
    const asset = await this.assetService.retrieveAsset(assetId, format);
    console.log(asset);
    if (asset) {
      console.log('asset', asset);
      if(format==='text'){
        this.clipboard.copy(asset.Content);
      }
      else if(format==='image'){
        this.copyToClipboard(`<img src="${asset.Content}" alt="Image">`);
      }
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Asset copied to clipboard',
      });
    }
  }

  copyToClipboard(html: string) {
    // Use the Clipboard API to copy the data to the clipboard
    navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' })
      })
    ]).then(
      () => {
        console.log('HTML data (image) copied to clipboard successfully!');
      },
      (error) => {
        console.error('Could not copy HTML data (image) to clipboard: ', error);
      }
    );
  }


  async deleteAsset(assetId: string) {
    if (await this.assetService.deleteAsset(assetId)) {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Asset deleted',
      });
      await this.refreshSidebar();
    }
  }

  async renameAsset(assetId: string, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;
    const asset = await this.assetService.renameAsset(assetId, inputValue);
    console.log(asset);
  }

  async refreshSidebar() {
    this.assets = await this.assetService.retrieveAll(
      this.editService.getParentFolderID()
    );
  }

  pageBreak() {
    this.editor.execute('pageBreak');
  }

  zoomIn() {
    if (this.currentZoom >= 2) return;
    this.currentZoom += 0.1; // Increase zoom by 10% (adjust as needed)
    this.currentZoom = parseFloat(this.currentZoom.toFixed(1));
    const element = document.getElementsByClassName(
      'center-page'
    )[0] as HTMLElement;
    element.style.transform = `scale(${this.currentZoom})`;
    element.style.transformOrigin = 'center top'; // Change the origin to the top left corner (adjust as needed)
    element.style.marginLeft = 'auto';
    this.reCenterPage();
  }

  zoomOut() {
    if (this.currentZoom <= 0.5) return;
    this.currentZoom -= 0.1; // Decrease zoom by 10% (adjust as needed)
    this.currentZoom = parseFloat(this.currentZoom.toFixed(1));
    const element = document.getElementsByClassName(
      'center-page'
    )[0] as HTMLElement;
    element.style.transform = `scale(${this.currentZoom})`;
    element.style.transformOrigin = 'center top'; // Change the origin to the top left corner (adjust as needed)
    this.reCenterPage();
  }

  reCenterPage() {
    const element = document.getElementsByClassName(
      'center-page'
    )[0] as HTMLElement;
    element.style.marginLeft = 'auto';
    if (this.sidebarVisible) {
      const leftPosition = this.getLeftPosition(element);
      if (leftPosition < 250) {
        element.style.marginLeft = '0';
        element.style.marginLeft = `${(270 - this.getLeftPosition(element))}px`;
      }
    } else {
      const leftPosition = this.getLeftPosition(element);
      if (leftPosition < -10) {
        element.style.marginLeft = '0';
        element.style.marginLeft = `${(20 - this.getLeftPosition(element))}px`;
      }
    }
  }

  getLeftPosition(element: HTMLElement): number {
    const rect = element.getBoundingClientRect();
    return rect.left;
  }


  //Functions for exporting from HTML
  convertToFileType(fileType: string) {
    let contents = `<body style="word-break: normal; font-family: Arial, Helvetica, sans-serif;">${this.editor.getData()}</body>`;
    const markdownID = this.editService.getMarkdownID();
    const name = this.editService.getName();
    if (markdownID && name) {
      this.fileService.exportDocumentToNewFileType(
        markdownID,
        name,
        contents,
        fileType
      );
    }
  }

}
