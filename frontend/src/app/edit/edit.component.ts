import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem} from "primeng/api";
import {FileUploadPopupComponent} from "../file-upload-popup/file-upload-popup.component";
import {DialogService} from "primeng/dynamicdialog";
import { FileService } from '../services/file.service';
import { EditService } from '../services/edit.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements AfterViewInit, OnInit {
  @ViewChild('quillEditor') quillEditor: any;
  documentContent: string | undefined = '';
  fileName: string|undefined = '';
  text: any;
  bold: boolean = false;
  sidebarVisible: boolean = true;
  public speedDialItems!: MenuItem[]

  constructor(
    private elementRef: ElementRef,
    private router: Router,
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
          this.navigateToPage("edit");
        }
      },
      {
        icon: 'pi pi-refresh',
        command: () => {
          // this.messageService.add({ severity: 'success', summary: 'Update', detail: 'Data Updated' });
        }
      },
      {
        icon: 'pi pi-trash',
        command: () => {
          // this.messageService.add({ severity: 'error', summary: 'Delete', detail: 'Data Deleted' });
        }
      },
      {
        icon: 'pi pi-upload',
        command: () => {
          this.showFileUploadPopup();
        }
      },
      {
        icon: 'pi pi-external-link',
      }
    ];
    this.fileName = this.editService.getName();
  }
  ngAfterViewInit() {
    const quill = this.quillEditor.getQuill();
    
    setTimeout(() => {//Why wait 0ms? I don't know but it works
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

  undo() {
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

  hideSideBar(){
    // get asset sidebar and set display none
    const sidebar = document.getElementsByClassName('assetSidebar')[0];

    if(sidebar)
    {
      if(this.sidebarVisible){
        sidebar.setAttribute('style', 'display:none');
        this.sidebarVisible = false;
      }
      else{
        sidebar.setAttribute('style', 'display:block');
        this.sidebarVisible = true;
      }
    }

  }

  rename() {
    console.log('rename');
    this.fileService.renameDocument(this.fileName);
  }

  delete() {
    console.log('delete');
    this.fileService.deleteDocument(this.editService.getMarkdownID());
    this.navigateToPage('home');
  }
}
