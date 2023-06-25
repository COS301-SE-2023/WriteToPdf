import {Component} from '@angular/core';
import {MessageService} from "primeng/api";
import { FileService } from '../services/file.service';

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

  constructor(private messageService: MessageService, private fileService: FileService) {
  }

  onUpload(event: any) {
    const file = event.files[0];
    const reader = new FileReader();
    this.uploadedFiles.push(file);

    reader.onload = (e: any) => {
      const fileContent = e.target.result;
      console.log(fileContent);
      
      this.fileService.importDocument(file.name, '', '', fileContent);
    };

    reader.readAsText(file);
    

    this.messageService.add({severity: 'info', summary: 'File Uploaded', detail: ''});
  }
}
