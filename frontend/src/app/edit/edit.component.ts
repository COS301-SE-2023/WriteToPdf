import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { FileUploadPopupComponent } from '../file-upload-popup/file-upload-popup.component';
import { ImageUploadPopupComponent } from '../image-upload-popup/image-upload-popup.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { DialogService } from 'primeng/dynamicdialog';
import { FileService } from '../services/file.service';
import { EditService } from '../services/edit.service';
import { AssetService } from '../services/asset.service';
import { Inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import {OCRDialogService} from "../ocr-popup/ocr-popup.service";
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { parse } from 'path';

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
  textFromAsset: any[] = [];
  textCopyDialog: boolean = false;
  noAssetsAvailable: boolean = false;


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
    private messageService: MessageService,
    private OCRDialog: OCRDialogService
  ) { }

  showOCRPopup(): void {
    this.OCRDialog.openDialog();
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: BeforeUnloadEvent) {
    this.editService.setContent(this.editor.getData());

    this.fileService.saveDocument(
      this.editor.getData(),
      this.editService.getMarkdownID(),
      this.editService.getPath()
    );
  }

  showImageUploadPopup(): void {
    const ref = this.dialogService.open(ImageUploadPopupComponent, {
      header: 'Upload Images',
      showHeader: true,
      closable: true,
      closeOnEscape: true,
      dismissableMask: true,
    });
  }

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

    const c = localStorage.getItem('content');
    const m = localStorage.getItem('markdownID');
    const n = localStorage.getItem('name');
    const p = localStorage.getItem('path');
    const pf = localStorage.getItem('parentFolderID');

    if(c!=null && m!=null && n!=null && p!=null && pf!=null)
      this.editService.setAll(c, m, n, p, pf);
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
          items: [
            'undo', 'redo',
            '|', 'heading',
            '|', 'fontfamily', 'fontsize', 'fontColor', 'fontBackgroundColor',
            '|', 'bold', 'italic', 'underline', 'strikethrough',
            '|', 'link', 'insertTable', 'blockQuote',
            '|', 'alignment',
            '|', 'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent'
          ],
          shouldNotGroupWhenFull: false
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
          this.elementRef.nativeElement.ownerDocument.body.style.height = '0';


          document
            .getElementsByClassName('toolsWrapper')[0]
            .appendChild(editor.ui.view.toolbar.element as Node);
          (window as any).editor = editor; // Adding 'editor' to the global window object for testing purposes.
          // Set the saved content after the editor is ready
          editor.setData(<string>this.editService.getContent());
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
    this.editService.setContent(this.editor.getData());
    this.saveDocumentContents();
    this.router.navigate([`/${pageName}`]);
  }

  navigateToCameraPage() {
    this.editService.setContent(this.editor.getData());
    this.saveDocumentContents();
    const data = {
      ParentFolderId: this.editService.getParentFolderID(),
      Path: this.editService.getPath(),
    };
    this.router.navigate(['/camera'], { state: data });
  }

  saveDocumentContents() {
    // Save the document quill content to localStorage when changes occur
    // const editableArea: HTMLElement = this.elementRef.nativeElement.querySelector('.document-editor__editable');
    let contents = this.editor.getData();
    this.fileService.saveDocument(
      contents,
      this.editService.getMarkdownID(),
      this.editService.getPath()
    );
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
        editor.setAttribute('style', 'left:0px;width:100%;margin:auto;');
        sidebar.setAttribute('style', 'left:-400px');
        showAssetSidebar.setAttribute('style', 'display:block');
        this.sidebarVisible = false;
      } else {
        //then show the sidebar

        editor.setAttribute('style', 'padding-right: 0px;left:260px');
        sidebar.setAttribute('style', 'display:block');
        showAssetSidebar.setAttribute('style', 'left:-10px');
        this.sidebarVisible = true;
      }
    }

    this.reCenterPage();
  }

  renameDocument() {
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

  async retrieveAsset(assetId: string, format: string, textId: string) {
    let currAssetIndex: number = 0;
    for (let i = 0; i < this.assets.length; i++) {
      if (this.assets[i].AssetID === assetId) {
        currAssetIndex = i;
        break;
      }
    }

    this.assets[currAssetIndex].NotRetrieving = true;
    // const asset = true;
    if (format === 'text') {
      let asset = this.assets[currAssetIndex];
      if (!asset.Blocks) {
        asset = await this.assetService.retrieveAsset(assetId, format, textId);
        this.assets[currAssetIndex].Blocks = asset.Blocks;
      }
      this.parseAssetText(asset);
      this.textCopyDialog = true;
      this.assets[currAssetIndex].NotRetrieving = false;
    }
    else if (format === 'image') {

      let asset = this.assets[currAssetIndex];
      if (!asset.CopyContent) {
        asset = await this.assetService.retrieveAsset(assetId, format, textId);
        this.assets[currAssetIndex].CopyContent = asset.Content;
        asset.CopyContent = asset.Content;
      }
      this.copyHtmlToClipboard(`<img src="${asset.CopyContent}" alt="Image">`);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Image copied to clipboard',
      });
      this.assets[currAssetIndex].NotRetrieving = false;
    }
  }

  async copyAllText(assetId: string, format: string, textId: string) {
    let currAssetIndex: number = 0;
    for (let i = 0; i < this.assets.length; i++) {
      if (this.assets[i].AssetID === assetId) {
        currAssetIndex = i;
        break;
      }
    }
    this.assets[currAssetIndex].NotRetrieving = true;
    if (this.assets[currAssetIndex].Blocks) {
      this.parseAssetText(this.assets[currAssetIndex]);

      let text = '';
      for (let i = 0; i < this.textFromAsset.length; i++) {
        text += this.textFromAsset[i] + '\n';
      }
      this.copyTextToClipboard(text);

    } else {
      const asset = await this.assetService.retrieveAsset(assetId, format, textId);

      this.assets[currAssetIndex].Blocks = asset.Blocks;
      this.parseAssetText(asset);

      let text = '';
      for (let i = 0; i < this.textFromAsset.length; i++) {
        text += this.textFromAsset[i] + '\n';
      }
      this.copyTextToClipboard(text);
    }
    this.assets[currAssetIndex].NotRetrieving = false;
    return;
  }

  parseAssetText(asset: any) {
    this.textFromAsset = [];
    for (let i = 0; i < asset.Blocks.length; i++) {
      if (asset.Blocks[i].BlockType === 'LINE')
        this.textFromAsset.push(asset.Blocks[i].Text);
    }
  }

  copyHtmlToClipboard(html: string) {
    // Use the Clipboard API to copy the data to the clipboard
    navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' })
      })
    ]).then(
      () => {
      },
      (error) => {
        console.error('Could not copy HTML data (image) to clipboard: ', error);
      }
    );
  }

  copyTextToClipboard(text: string) {
    // Use the Clipboard API to copy the data to the clipboard
    navigator.clipboard.write([
      new ClipboardItem({
        'text/plain': new Blob([text], { type: 'text/plain' })
      })
    ]).then(
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Text copied to clipboard',
        });
        this.textCopyDialog = false;
      },
      (error) => {
        console.error('Could not copy text to clipboard: ', error);
      }
    );
  }


  async deleteAsset(assetId: string) {
    let currAssetIndex: number = 0;
    for (let i = 0; i < this.assets.length; i++) {
      if (this.assets[i].AssetID === assetId) {
        currAssetIndex = i;
        break;
      }
    }

    this.assets[currAssetIndex].Deleted=true;

    if (await this.assetService.deleteAsset(assetId)) {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Asset deleted',
      });
      this.assets.splice(currAssetIndex, 1);
    }
    else{
      this.assets[currAssetIndex].Deleted=false;

    }
  }

  async renameAsset(assetId: string, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;
    const asset = await this.assetService.renameAsset(assetId, inputValue);
    for (let i = 0; i < this.assets.length; i++) {
      if (this.assets[i].AssetID === assetId) {
        this.assets[i].FileName = inputValue;
      }
    }
  }

  async refreshSidebar() {
    this.assets = await this.assetService.retrieveAll(
      this.editService.getParentFolderID()
    );
    this.noAssetsAvailable = this.assets.length === 0;
    this.assets.sort((a, b) => new Date(b.DateCreated).getTime() - new Date(a.DateCreated).getTime());
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

  getZoom(){
    return `${Math.floor(this.currentZoom*100)}%`;
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
    let contents = `<div style="word-break: normal; font-family: Arial, Helvetica, sans-serif; padding:35px 75px 75px; width:794px; margin:auto; background-color:white;">${this.editor.getData()}</div>`;
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

  capitalizeFirstLetter(inputString: string): string {
    if (!inputString || inputString.length === 0) {
      return inputString; // Return the input string as-is if it's empty or null.
    }

    return inputString.charAt(0).toUpperCase() + inputString.slice(1);
  }

  formatDate(dateString: string): string {
    if (!dateString || dateString.length === 0) {
      return dateString; // Return the input string as-is if it's empty or null.
    }

    const date = new Date(dateString);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
  }
}
