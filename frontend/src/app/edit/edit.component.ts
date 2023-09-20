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
import { VersionControlService } from '../services/version.control.service';
import { Inject } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { set } from 'cypress/types/lodash';
import { PageBreak } from '@ckeditor/ckeditor5-page-break';

import html2pdf from 'html2pdf.js/dist/html2pdf';

import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { parse } from 'path';
import { SnapshotDTO } from '../services/dto/snapshot.dto';
import { DiffDTO } from '../services/dto/diff.dto';

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
  history: any[] = [];
  textFromAsset: any[] = [];
  textCopyDialog: boolean = false;
  noAssetsAvailable: boolean = false;
  isTouchScreen: boolean = false;
  sideBarTab: boolean = false;

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
    private versionControlService: VersionControlService,
    private confirmationService: ConfirmationService
  ) {}

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: BeforeUnloadEvent) {
    if (this.editService.getContent() !== '') this.saveDocumentContents();
  }

  @HostListener('window:mousewheel', ['$event'])
  onMouseWheel(event: WheelEvent) {
    if (event.shiftKey) {
      if (event.deltaY > 0) {
        this.zoomOut();
      } else {
        this.zoomIn();
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Check if the Ctrl key is pressed and the 's' key (or 'S') is pressed simultaneously
    if (event.ctrlKey && (event.key === 's' || event.key === 'S')) {
      event.preventDefault();
      this.saveDocumentContents();
    }
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

    //get window width
    this.isTouchScreen = window.matchMedia('(pointer: coarse)').matches;
    const width = window.innerWidth;
    if (width < 800) this.hideSideBar();
    const c = localStorage.getItem('content');
    const m = localStorage.getItem('markdownID');
    const n = localStorage.getItem('name');
    const p = localStorage.getItem('path');
    const pf = localStorage.getItem('parentFolderID');
    const sl = localStorage.getItem('safeLock');
    const dp = localStorage.getItem('encryptedDocumentPassword');
    this.versionControlService.setLatestVersionContent(c ? (c as string) : '');

    if (
      c != null &&
      m != null &&
      n != null &&
      p != null &&
      pf != null &&
      sl != null &&
      dp != null
    )
      this.editService.setAll(
        c,
        m,
        n,
        p,
        pf,
        sl === 'true',
        this.editService.decryptPassword(dp)
      );
    this.fileName = this.editService.getName();

    this.history.push({
      name: 'Latest',
      date: 'now',
      html: this.editService.getContent(),
      id: 'LATEST',
      isCurrent: true,
    });
    this.history.push({
      name: 'Version 7',
      date: '01-01-1977',
      html: '',
      id: '8',
    });
    this.history.push({
      name: 'Version 6',
      date: '01-01-1976',
      html: '<s><p><span style="background-color:hsl(0, 75%, 60%);">Text added from V0 to V1.</span style="background-color:hsl(0, 75%, 60%);"></p> <p><span style="background-color:hsl(0, 75%, 60%);">More Text added from V1 to V2.</span></p><p><span style="background-color:hsl(0, 75%, 60%);">Addition from V3 to V4</span></p></s>',
      id: '7',
    });
    this.history.push({
      name: 'Version 5',
      date: '01-01-1975',
      html: '<p><span style="background-color:hsl(0, 75%, 60%);">Text to be removed soon.</span></p> <p><span>Text added from V0 to V1.</span></p> <p><span>More Text added from V1 to V2.</span></p><p><span >Addition from V3 to V4</span></p>',
      id: '6',
    });
    this.history.push({
      name: 'Version 4',
      date: '01-01-1974',
      html: '<p><span >Text to be removed soon.</span></p> <p><span>Text added from V0 to V1.</span></p> <p><span>More Text added from V1 to V2.</span></p><p><span style="background-color:hsl(120, 75%, 60%);">Addition from V3 to V4</span></p>',
      id: '5',
    });
    this.history.push({
      name: 'Version 3',
      date: '01-01-1973',
      html: '<p><span style="background-color:hsl(120, 75%, 60%);">Text to be removed soon.</span></p> <p><span>Text added from V0 to V1.</span></p> <p><span>More Text added from V1 to V2.</span></p>',
      id: '4',
    });
    this.history.push({
      name: 'Version 2',
      date: '01-01-1972',
      html: '<p><span>Text added from V0 to V1.</span></p> <p><span style="background-color:hsl(120, 75%, 60%);">More Text added from V1 to V2.</span></p>',
      id: '3',
    });
    this.history.push({
      name: 'Version 1',
      date: '01-01-1971',
      html: '<p><span style="background-color:hsl(120, 75%, 60%);">Text added from V0 to V1.</span></p>',
      id: '2',
    });
    this.history.push({
      name: 'Version 0',
      date: '01-01-1970',
      html: '',
      id: '1',
    });
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
            'undo',
            'redo',
            '|',
            'heading',
            '|',
            'fontfamily',
            'fontsize',
            'fontColor',
            'fontBackgroundColor',
            '|',
            'bold',
            'italic',
            'underline',
            'strikethrough',
            '|',
            'link',
            'insertTable',
            'blockQuote',
            '|',
            'alignment',
            '|',
            'bulletedList',
            'numberedList',
            'todoList',
            'outdent',
            'indent',
          ],
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
    this.refreshSidebarHistory();
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

  exitToHome() {
    this.confirmationService.confirm({
      message: 'Do you want to save before you leave?',
      header: 'Save Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Exit and Save',
      rejectLabel: 'Exit without Saving',
      accept: () => {
        this.editService.setContent(this.editor.getData());
        this.saveDocumentContents();
        this.router.navigate(['/home']);
      },
      reject: (type: any) => {
        if (type === 1) this.router.navigate(['/home']);
      },
    });
  }

  async saveDocumentContents() {
    // Save the document quill content to localStorage when changes occur
    // const editableArea: HTMLElement = this.elementRef.nativeElement.querySelector('.document-editor__editable');

    let contents = this.editor.getData();
    let pass = this.editService.getDocumentPassword();

    const latestVersionContent =
      this.versionControlService.getLatestVersionContent();

    const readablePatch = this.versionControlService.getReadablePatch(
      latestVersionContent,
      contents
    );
    const markdownID = this.editService.getMarkdownID();

    if (pass != '' && pass != undefined) {
      await this.fileService.saveDocument(
        this.fileService.encryptSafeLockDocument(contents, pass),
        this.editService.getMarkdownID(),
        this.editService.getPath(),
        this.editService.getSafeLock()
      );

      if (readablePatch !== '')
        this.versionControlService.saveDiff(
          markdownID ? (markdownID as string) : '',
          this.fileService.encryptSafeLockDocument(readablePatch, pass)
        );
    } else {
      await this.fileService.saveDocument(
        contents,
        this.editService.getMarkdownID(),
        this.editService.getPath(),
        this.editService.getSafeLock()
      );

      if (readablePatch !== '')
        this.versionControlService.saveDiff(
          markdownID ? (markdownID as string) : '',
          readablePatch
        );
    }

    this.versionControlService.setLatestVersionContent(contents);
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
    } else if (format === 'image') {
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
      const asset = await this.assetService.retrieveAsset(
        assetId,
        format,
        textId
      );

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
    navigator.clipboard
      .write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
        }),
      ])
      .then(
        () => {},
        (error) => {
          console.error(
            'Could not copy HTML data (image) to clipboard: ',
            error
          );
        }
      );
  }

  copyTextToClipboard(text: string) {
    // Use the Clipboard API to copy the data to the clipboard
    navigator.clipboard
      .write([
        new ClipboardItem({
          'text/plain': new Blob([text], { type: 'text/plain' }),
        }),
      ])
      .then(
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

    this.assets[currAssetIndex].Deleted = true;

    if (await this.assetService.deleteAsset(assetId)) {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Asset deleted',
      });
      this.assets.splice(currAssetIndex, 1);
    } else {
      this.assets[currAssetIndex].Deleted = false;
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
    this.noAssetsAvailable = false;
    this.assets = [];
    this.assets = await this.assetService.retrieveAll(
      this.editService.getParentFolderID()
    );
    this.noAssetsAvailable = this.assets.length === 0;
    this.assets.sort(
      (a, b) =>
        new Date(b.DateCreated).getTime() - new Date(a.DateCreated).getTime()
    );
  }

  async refreshSidebarHistory() {
    this.history = [];
    this.versionControlService
      .retrieveAllHistory(this.editService.getMarkdownID() as string)
      .then((data) => {
        const snapshot = JSON.parse(
          JSON.stringify(data.SnapshotHistory)
        ) as SnapshotDTO[];
        const diff = JSON.parse(JSON.stringify(data.DiffHistory)) as DiffDTO[];

        snapshot.map((a, i) => {
          a.LastModifiedString = this.formatDate(a.LastModified);
          a.OrderNumber = i + 1;
          a.Name = 'Snapshot ' + a.OrderNumber;
          a.ChildDiffs = [];
          let versionNumber = 0;
          for (let j = 0; j < diff.length; j++) {
            if (a.SnapshotID === diff[j].SnapshotID) {
              a.ChildDiffs.push(diff[j]);
              diff[j].LastModifiedString = this.formatDate(
                diff[j].LastModified
              );
              diff[j].VersionNumber = ++versionNumber;
              diff[j].Name = 'Version ' + diff[j].VersionNumber;
              diff[j].HasSnapshot = true;
            }
          }
        });
        snapshot
          .sort((a, b) => {
            return a.OrderNumber < b.OrderNumber
              ? 1
              : a.OrderNumber > b.OrderNumber
              ? -1
              : 0;
          })
          .map((a) =>
            a.ChildDiffs.sort((a, b) => {
              return a.VersionNumber < b.VersionNumber
                ? 1
                : a.VersionNumber > b.VersionNumber
                ? -1
                : 0;
            })
          );
        // for (let i = 0; i < snapshot.length; i++)

        let diffNumber = 0;
        for (let i = 0; i < diff.length; i++) {
          if (!diff[i].HasSnapshot) {
            diff[i].LastModifiedString = this.formatDate(diff[i].LastModified);
            diff[i].VersionNumber = ++diffNumber;
            diff[i].Name = 'Diff ' + diff[i].VersionNumber;
            this.history.push(diff[i]);
          }
        }
        snapshot.map((a) => this.history.push(a));

        console.log(this.history);
      });
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

  getZoom() {
    return `${Math.floor(this.currentZoom * 100)}%`;
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
        element.style.marginLeft = `${270 - this.getLeftPosition(element)}px`;
      }
    } else {
      const leftPosition = this.getLeftPosition(element);
      if (leftPosition < -10) {
        element.style.marginLeft = '0';
        element.style.marginLeft = `${20 - this.getLeftPosition(element)}px`;
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

  formatDate(dateString: Date): string {
    if (!dateString) {
      return dateString; // Return the input string as-is if it's empty or null.
    }

    const date = new Date(dateString);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  enableReadOnly() {
    this.editor.enableReadOnlyMode('');
  }

  disableReadOnly() {
    this.editor.disableReadOnlyMode('');
  }

  insertContent(obj: any) {
    this.deselectAllHistory();
    obj.isCurrent = true;
    if (obj.SnapshotID === 'LATEST') {
      this.disableReadOnly();
      this.editor.setData(obj.Content);
      return;
    }
    this.enableReadOnly();
    this.editor.setData(obj.Content);
  }

  deselectAllHistory() {
    for (let i = 0; i < this.history.length; i++) {
      this.history[i].isCurrent = false;
    }
  }

  expandSnapshot(snapshot: any, event: any) {
    if (snapshot.expanded) {
      snapshot.expanded = false;
    } else {
      snapshot.expanded = true;
    }

    const arrowElement = event.target;

    arrowElement.classList.toggle('expanded');

    event.stopPropagation();
  }
}
