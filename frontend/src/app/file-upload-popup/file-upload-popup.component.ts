import {Component} from '@angular/core';
import {MessageService} from "primeng/api";

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

  constructor(private messageService: MessageService) {
  }

  onUpload(event: any) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
      let reader = new FileReader();
      reader.onload = () => {
        let arrayBuffer = reader.result as ArrayBuffer;
        var mammoth = require("mammoth/mammoth.browser");
        mammoth.convertToHtml({arrayBuffer: arrayBuffer})
          .then(function (result: any) {
            var html = result.value;
            // const { convertHtmlToDelta } = require('node-quill-converter');
            // let delta = convertHtmlToDelta(html);// The generated HTML
            // var messages = result.messages; // Any messages, such as warnings during conversion
          })
          .catch(function (error: any) {
            console.error(error);
          });
      };
      reader.readAsArrayBuffer(file);
    }

    this.messageService.add({severity: 'info', summary: 'File Uploaded', detail: ''});
  }
}
