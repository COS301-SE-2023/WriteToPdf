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

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements AfterViewInit, OnInit {
  @ViewChild('quillEditor') quillEditor: any;
  documentContent: string | undefined = '';
  fileName: string | undefined = '';
  text: any;
  bold: boolean = false;
  sidebarVisible: boolean = true;
  exportDialogVisible: boolean = false;
  public speedDialItems!: MenuItem[];
  assets: any[] = [];

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

    this.assets = await this.assetService.retrieveAll();
    console.log(this.assets);
  }
  ngAfterViewInit() {
    const quill = this.quillEditor.getQuill();

    setTimeout(() => {
      //Why wait 0ms? I don't know but it works
      const contents = this.editService.getContent();
      this.documentContent = contents;
      if (contents) {
        quill.setContents(JSON.parse(contents));
      }
    }, 0);

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

  save() {
    // Save the document quill content to localStorage when changes occur
    const quill = this.quillEditor.getQuill();
    const contents = quill.getContents();

    this.fileService.saveDocument(
      contents,
      this.editService.getMarkdownID(),
      this.editService.getPath()
    );
  }

  async load() {
    // Load the document quill content from localStorage when changes occur
    const quill = this.quillEditor.getQuill();

    const contents = await this.fileService.retrieveDocument(
      this.editService.getMarkdownID(),
      this.editService.getPath()
    );
    if (contents) {
      quill.setContents(JSON.parse(contents));
    }
    console.log(contents);
  }

  async undo() {
    const quill = this.quillEditor.getQuill();
    const history = quill.history;

    if (history.stack.undo.length > 1) {
      history.undo();
    }
  }

  redo() {
    const quill = this.quillEditor.getQuill();
    quill.history.redo();
  }

  hideSideBar() {
    // get asset sidebar and set display none
    const sidebar = document.getElementsByClassName('assetSidebar')[0];
    const editor = document.getElementsByClassName('editor')[0];
    const showAssetSidebar = document.getElementsByClassName('showAssetSidebar')[0];
    if (sidebar && editor && showAssetSidebar) {
      if (this.sidebarVisible) {
        editor.setAttribute('style', 'left:130px');
        editor.setAttribute('style', 'padding-right: 130px');
        sidebar.setAttribute('style', 'display:none');
        showAssetSidebar.setAttribute('style', 'display:block');
        this.sidebarVisible = false;
      } else {
        editor.setAttribute('style', 'left:260px');
        editor.setAttribute('style', 'padding-right: 0px');
        sidebar.setAttribute('style', 'display:block');
        showAssetSidebar.setAttribute('style', 'display:none');
        this.sidebarVisible = true;
      }
    }

    // setTimeout(() => {
    //   this.hideSideBar();
    // },3000);
  }

  rename() {
    console.log('rename');
    this.fileService.renameDocument(
      this.editService.getMarkdownID(),
      this.fileName,
      this.editService.getPath()
    ).then((Boolean) => {
      if (Boolean) {
        this.editService.setName(this.fileName);
      }
    });
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
    const quill = this.quillEditor.getQuill();
    const contents = quill.getContents();

    const markdownID = this.editService.getMarkdownID();
    const name = this.editService.getName();

    if (markdownID && name) {
      this.fileService.exportDocument(markdownID, name, contents, 'txt');
    }
  }

  async retrieveAsset(assetId:string){
    const asset = await this.assetService.retrieveAsset(assetId);
    console.log(asset);
    if (asset) {
      this.clipboard.copy(asset.Content);
      this.messageService.add({severity:'success', summary:'Success', detail:'Asset copied to clipboard'});
    }
  }

  async deleteAsset(assetId:string){
    if(await this.assetService.deleteAsset(assetId)){
      this.messageService.add({severity:'success', summary:'Success', detail:'Asset deleted'});
      await this.refreshSidebar();
    }
  }

  async renameAsset(assetId: string, event: Event){
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;
    const asset = await this.assetService.renameAsset(assetId, inputValue);
    console.log(asset);
  }

  async refreshSidebar(){
    this.assets = await this.assetService.retrieveAll();
  }
}
