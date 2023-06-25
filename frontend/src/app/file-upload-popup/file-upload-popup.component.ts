import {Component} from '@angular/core';
import {MessageService} from "primeng/api";
import { FileService } from '../services/file.service';
import { NodeService } from '../services/home.service';
import { EditService } from '../services/edit.service';
import { Router } from '@angular/router';

// import * as mammoth from "mammoth"
interface UploadEvent {
  originalEvent: Event;
  files: File[];
}

@Component({
  selector: 'app-file-upload-popup',
  templateUrl: './file-upload-popup.component.html',
  styleUrls: ['./file-upload-popup.component.scss']
})
export class FileUploadPopupComponent {
  uploadedFiles: any[] = [];

  constructor(private messageService: MessageService, private fileService: FileService, private nodeService: NodeService, private editService: EditService, private router: Router) {
  }

  onUpload(event: any) {
    const file = event.files[0];
    const reader = new FileReader();
    this.uploadedFiles.push(file);

    reader.onload = (e: any) => {
      const fileContent = e.target.result;
      console.log(fileContent);
      const name = file.name.split('.')[0];
      const type = file.name.split('.')[1];
      console.log(type);
      this.fileService.importDocument(name, '', '', fileContent, type).then((response) => {
        if (response.MarkdownID != undefined)
          this.nodeService.addFile(response);
        
        this.editService.setMarkdownID(response.MarkdownID);
        this.editService.setPath(response.Path);
        this.editService.setName(response.Name);
        this.editService.setParentFolderID(response.ParentFolderID);

        this.navigateToPage("edit");

      });
    };



    reader.readAsText(file);
    

    this.messageService.add({severity: 'info', summary: 'File Uploaded', detail: ''});
  }

  navigateToPage(pageName: string): void {
    this.router.navigate([`${pageName}`]);
  }
}
