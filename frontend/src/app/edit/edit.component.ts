import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  Inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem, MessageService, ConfirmationService } from 'primeng/api';
import { FileUploadPopupComponent } from '../file-upload-popup/file-upload-popup.component';
import { ImageUploadPopupComponent } from '../image-upload-popup/image-upload-popup.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { DialogService } from 'primeng/dynamicdialog';
import { FileService } from '../services/file.service';
import { EditService } from '../services/edit.service';
import { AssetService } from '../services/asset.service';
import { VersionControlService } from '../services/version.control.service';
import { VersioningApiService } from '../services/versioning-api.service';
import html2pdf from 'html2pdf.js/dist/html2pdf';
import { OCRDialogService } from '../services/ocr-popup.service';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { SnapshotDTO } from '../services/dto/snapshot.dto';
import { DiffDTO } from '../services/dto/diff.dto';
import { parse } from 'path';
import { set } from 'cypress/types/lodash';

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
  saving: boolean = false;

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
    private confirmationService: ConfirmationService,
    private versioningApiService: VersioningApiService,
    private OCRDialog: OCRDialogService
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

  showOCRPopup(textractResponse: any): void {
    let ocrDataPassedOver = [];
    ocrDataPassedOver.push(textractResponse);
    ocrDataPassedOver.push(this.editor);
    // TODO find the relevant button on the asset that retrieves the textract response,
    // and pass that response to the OCRDialogService.
    this.OCRDialog.openDialog(ocrDataPassedOver);
  }

  showImageUploadPopup(): void {
    const ref = this.dialogService.open(ImageUploadPopupComponent, {
      header: 'Upload Images',
      showHeader: true,
      closable: true,
      closeOnEscape: true,
      dismissableMask: true,
    });
    ref.onClose.subscribe(() => {
      this.refreshSidebar();
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

    if (this.saving) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Please wait before saving again.',
      });
      return;
    }
    this.saving = true;
    let contents = this.editor.getData();
    let pass = this.editService.getDocumentPassword();

    const latestVersionContent =
      this.versionControlService.getLatestVersionContent();

    const readablePatch = this.versionControlService.getReadablePatch(
      latestVersionContent,
      contents
    );
    const markdownID = this.editService.getMarkdownID();
    localStorage.setItem('content', contents);
    if (pass != '' && pass != undefined) {
      await this.fileService.saveDocument(
        this.fileService.encryptSafeLockDocument(contents, pass),
        this.editService.getMarkdownID(),
        this.editService.getPath(),
        this.editService.getSafeLock()
      );
      if (readablePatch !== '')
        await this.versioningApiService.saveDiff(
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
        await this.versioningApiService.saveDiff(
          markdownID ? (markdownID as string) : '',
          readablePatch
        );
    }

    this.versionControlService.setLatestVersionContent(contents);
    this.saving = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Document Saved',
      detail: 'You can now save again.',
    });
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
        sidebar.setAttribute('style', 'z-index: -1000');
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
          localStorage.setItem('name', this.fileName as string);
        }
      });
  }

  showDialog() {
    this.exportDialogVisible = true;
  }

  constructHTMLTable(table: any): string {
    let returnString = '';
    for (let eachRow of table['Table']) {
      returnString += '<tr>';
      for (let eachCol of eachRow) {
        returnString += '<td>' + eachCol + '</td>';
      }
      returnString += '</tr>';
    }
    return '<table>' + returnString + '</table>';
  }

  async retrieveAssetTextToCopy(
    assetId: string,
    format: string,
    textId: string
  ) {
    let currAssetIndex: number = 0;
    for (let i = 0; i < this.assets.length; i++) {
      if (this.assets[i].AssetID === assetId) {
        currAssetIndex = i;
        break;
      }
    }
    this.assets[currAssetIndex].NotRetrieving = true;
    // const asset = true;
    if (format === 'text' || format === 'table') {
      let asset = this.assets[currAssetIndex];
      if (!asset.Blocks) {
        var assetResponse = await this.assetService.retrieveAsset(
          assetId,
          format,
          textId
        );
        this.assets[currAssetIndex].Blocks = asset.Blocks;
      }
      this.assets[currAssetIndex].NotRetrieving = false;
      let assetObjectJSON = JSON.parse(assetResponse.Content);
      let allElements = assetObjectJSON.elements;
      let copyText = '';
      for (let i = 0; i < assetObjectJSON.elements.length; i++) {
        if (allElements[i].hasOwnProperty('Text Element')) {
          copyText += allElements[i]['Text Element']['Lines'] + '\n';
        } else {
          copyText +=
            this.constructHTMLTable(allElements[i]['Table Element']) + '\n';
        }
      }
      this.copyHtmlToClipboard(copyText);
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
    if (format === 'text' || format === 'table') {
      let asset = this.assets[currAssetIndex];
      if (!asset.Blocks) {
        var assetResponse = await this.assetService.retrieveAsset(
          assetId,
          format,
          textId
        );
        this.assets[currAssetIndex].Blocks = asset.Blocks;
      }
      this.assets[currAssetIndex].NotRetrieving = false;
      this.showOCRPopup(assetResponse);
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
      if (this.assets.length === 0) this.noAssetsAvailable = true;
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
    this.versioningApiService
      .retrieveAllHistory(this.editService.getMarkdownID() as string)
      .then((data) => {
        const snapshot = JSON.parse(
          JSON.stringify(data.SnapshotHistory)
        ) as SnapshotDTO[];
        const diff = JSON.parse(JSON.stringify(data.DiffHistory)) as DiffDTO[];

        snapshot.sort((a, b) => {
          return a.LastModified < b.LastModified
            ? 1
            : a.LastModified > b.LastModified
            ? -1
            : 0;
        });

        snapshot.forEach((a, i) => {
          a.LastModifiedString = this.formatDate(a.LastModified);
          a.OrderNumber = i + 1;
          a.Name = 'Snapshot ' + a.OrderNumber;
          a.ChildDiffs = [];
          for (let j = 0; j < diff.length; j++) {
            if (
              a.SnapshotID === diff[j].SnapshotID &&
              a.LastModified > diff[j].LastModified
            ) {
              a.ChildDiffs.push(diff[j]);
              diff[j].LastModifiedString = this.formatDate(
                diff[j].LastModified
              );
              diff[j].HasSnapshot = true;
            }
          }
        });
        snapshot.forEach((a) =>
          a.ChildDiffs.sort((a, b) => {
            return a.LastModified < b.LastModified
              ? 1
              : a.LastModified > b.LastModified
              ? -1
              : 0;
          }).forEach((a, i, arr) => {
            a.VersionNumber = arr.length - i + 1;
            a.Name = 'Version ' + a.VersionNumber;
          })
        );

        let diffNumber = 0;
        let currentSnapshot = new SnapshotDTO();
        currentSnapshot.ChildDiffs = [];
        for (let i = 0; i < diff.length; i++) {
          if (!diff[i].HasSnapshot) {
            diff[i].LastModifiedString = this.formatDate(diff[i].LastModified);
            diff[i].VersionNumber = ++diffNumber;
            diff[i].Name = 'Diff ' + diff[i].VersionNumber;
            currentSnapshot.ChildDiffs.push(diff[i]);
          }
        }
        currentSnapshot.Name = 'Latest';
        currentSnapshot.LastModifiedString = 'now';
        this.history.push(currentSnapshot);
        snapshot.forEach((a) => this.history.push(a));

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
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    if (!dateString) return '';
    const date = new Date(dateString);

    const dd = String(date.getDate()).padStart(2, '0');
    const mm = date.getMonth(); // January is 0!
    const yyyy = date.getFullYear();

    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');

    return `${dd} ${months[mm]}, ${hh}:${min}:${ss}`;
  }

  formatAssetDate(dateString: Date): string {
    if (!dateString) return '';
    const date = new Date(dateString);

    const dd = String(date.getDate()).padStart(2, '0');
    const mm = date.getMonth(); // January is 0!
    const yyyy = date.getFullYear();

    return `${dd}-${mm}-${yyyy}`;
  }

  enableReadOnly() {
    this.editor.enableReadOnlyMode('');
  }

  disableReadOnly() {
    this.editor.disableReadOnlyMode('');
  }

  insertContent(obj: any) {
    console.log('Just clicked on: ', obj);
    if (!obj.Content) return;
    this.deselectAllHistory();
    obj.isCurrent = true;
    if (obj.Name === 'Latest') {
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

    //retrieve all diff content and previous snapshot content
    this.versioningApiService
      .loadHistorySet(
        this.editService.getMarkdownID() as string,
        snapshot.ChildDiffs,
        snapshot.snapshotID
      )
      .then((data) => {
        if (data !== null) {
          console.log('Process diff data.', data);
          snapshot.Content = data.SnapshotHistory[0].Content;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error retrieving history set',
          });
          return;
        }
      });
  }

  getSnapshotContent(snapshot: any) {
    console.log('Hello', snapshot);
  }

  getDiffContent(diff: any) {
    console.log('Hello', diff);
  }
}
