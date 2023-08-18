import { Injectable } from '@angular/core';
import { MarkdownFileDTO } from './dto/markdown_file.dto';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from './user.service';
import { EditService } from './edit.service';
import { DirectoryFilesDTO } from './dto/directory_files.dto';
import { ImportDTO } from './dto/import.dto';
// import { resolve } from 'path';
// import { ExportDTO } from './dto/export.dto';
import { MessageService } from 'primeng/api';
import { environment } from '../../environments/environment';
import * as CryptoJS from 'crypto-js';

import { ConversionService } from './conversion.service';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor(
    private http: HttpClient,
    private userService: UserService,
    private editService: EditService,
    private messageService: MessageService,
    private conversionService: ConversionService
  ) {}

  saveDocument(
    content: string | undefined,
    markdownID: string | undefined,
    path: string | undefined
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sendSaveData(content, markdownID, path).subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.status === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'File saved successfully',
            });
            resolve(true);
          } else {
            resolve(false);
          }
        },
      });
    });
  }

  sendSaveData(
    content: string | undefined,
    markdownID: string | undefined,
    path: string | undefined
  ): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}file_manager/save_file`;
    const body = new MarkdownFileDTO();

    body.UserID = this.userService.getUserID();
    body.Content = this.encryptDocument(content);
    body.MarkdownID = markdownID;
    body.Path = path;
    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  retrieveDocument(
    markdownID: string | undefined,
    path: string | undefined
  ): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.sendRetrieveData(markdownID, path).subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.status === 200) {
            resolve(this.decryptDocument(response.body.Content));
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'File could not be retrieved',
            });
            resolve(false);
          }
        },
      });
    });
  }

  sendRetrieveData(
    markdownID: string | undefined,
    path: string | undefined
  ): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}file_manager/retrieve_file`;
    const body = new MarkdownFileDTO();

    body.UserID = this.userService.getUserID();
    body.MarkdownID = markdownID;
    body.Path = path;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  createDocument(
    name: string,
    path: string | undefined,
    parentFolderID: string | undefined
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sendCreateData(name, path, parentFolderID).subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.status === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'File created successfully',
            });

            this.editService.setAll(
              '',
              response.body.MarkdownID,
              response.body.Name,
              response.body.Path,
              response.body.ParentFolderID
            );
            
            resolve(true);
          } else {
            resolve(false);
          }
        },
      });
    });
  }

  sendCreateData(
    name: string,
    path: string | undefined,
    parentFolderID: string | undefined
  ): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}file_manager/create_file`;
    const body = new MarkdownFileDTO();

    body.UserID = this.userService.getUserID();
    body.Path = path;
    body.Name = name;
    body.ParentFolderID = parentFolderID;
    body.SafeLock = false;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  deleteDocument(markdownID: string | undefined): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sendDeleteData(markdownID).subscribe({
        next: (response: HttpResponse<any>) => {
          console.log(response);
          if (response.status === 200) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
      });
    });
  }

  sendDeleteData(
    markdownID: string | undefined
  ): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}file_manager/delete_file`;
    const body = new MarkdownFileDTO();

    body.UserID = this.userService.getUserID();
    body.Path = '';
    body.MarkdownID = markdownID;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  renameDocument(
    markdownFileID: string | undefined,
    fileName: string | undefined,
    path: string | undefined
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sendRenameData(markdownFileID, fileName, path).subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.status === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'File renamed successfully',
            });
            resolve(true);
          } else {
            resolve(false);
          }
        },
      });
    });
  }

  sendRenameData(
    markdownFileID: string | undefined,
    name: string | undefined,
    path: string | undefined
  ): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}file_manager/rename_file`;
    const body = new MarkdownFileDTO();

    body.UserID = this.userService.getUserID();
    body.MarkdownID = markdownFileID;
    body.Path = path;
    body.Name = name;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  moveDocument(
    markdownID: string | undefined,
    path: string | undefined,
    parentFolderID: string | undefined
  ): Promise<MarkdownFileDTO> {
    // Will need to rerun directory structure function with new moved file.
    return new Promise<MarkdownFileDTO>((resolve, reject) => {
      this.sendMoveData(markdownID, path, parentFolderID).subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.status === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'File moved successfully',
            });
            const markdownFile = new MarkdownFileDTO();
            markdownFile.MarkdownID = response.body.MarkdownID;
            markdownFile.Name = response.body.Name;
            markdownFile.Path = response.body.Path;
            markdownFile.ParentFolderID = response.body.ParentFolderID;

            resolve(markdownFile);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'File move failed',
            });
            reject();
          }
        },
      });
    });
  }

  sendMoveData(
    markdownID: string | undefined,
    path: string | undefined,
    parentFolderID: string | undefined
  ): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}file_manager/move_file`;
    const body = new MarkdownFileDTO();

    body.UserID = this.userService.getUserID();
    body.Path = path;
    body.MarkdownID = markdownID;
    body.ParentFolderID = parentFolderID;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  retrieveAllFiles(): Promise<MarkdownFileDTO[]> {
    return new Promise<MarkdownFileDTO[]>((resolve, reject) => {
      this.sendRetrieveAllFiles().subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.status === 200) {
            const body = response.body;
            let files: MarkdownFileDTO[] = [];
            for (let i = 0; i < body.Files.length; i++) {
              const fileDTO = new MarkdownFileDTO();

              fileDTO.DateCreated = body.Files[i].DateCreated;
              fileDTO.LastModified = body.Files[i].LastModified;
              fileDTO.MarkdownID = body.Files[i].MarkdownID;
              fileDTO.Name = body.Files[i].Name;
              fileDTO.ParentFolderID = body.Files[i].ParentFolderID;
              fileDTO.Path = body.Files[i].Path;
              fileDTO.Size = body.Files[i].Size;

              files.push(fileDTO);
            }
            resolve(files);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'File retrieval failed',
            });
            reject();
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'File retrieval failed',
          });
          reject();
        },
      });
    });
  }

  sendRetrieveAllFiles(): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}file_manager/retrieve_all_files`;
    const body = new DirectoryFilesDTO();

    body.UserID = this.userService.getUserID();

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  importDocument(
    name: string,
    path: string,
    parentFolderID: string,
    content: string,
    type: string
  ): Promise<MarkdownFileDTO> {
    return new Promise<MarkdownFileDTO>((resolve, reject) => {
      this.sendImportData(name, path, parentFolderID, content, type).subscribe({
        next: (response: HttpResponse<any>) => {
          const outputFile = new MarkdownFileDTO();
          if (response.status === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'File imported successfully',
            });
            outputFile.Name = response.body.Name;
            outputFile.Path = response.body.Path;
            outputFile.ParentFolderID = response.body.ParentFolderID;
            outputFile.Content = this.decryptDocument(response.body.Content);
            outputFile.MarkdownID = response.body.MarkdownID;
            outputFile.Size = response.body.Size;
            outputFile.DateCreated = response.body.DateCreated;
            outputFile.LastModified = response.body.LastModified;
            resolve(outputFile);
          } else {
            resolve(outputFile);
          }
        },
      });
    });
  }

  sendImportData(
    name: string,
    path: string,
    parentFolderID: string,
    content: string,
    type: string
  ): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}file_manager/import`;
    const body = new ImportDTO();

    body.UserID = this.userService.getUserID();
    body.Path = path;
    body.Name = name;
    body.ParentFolderID = parentFolderID;
    body.Content = this.encryptDocument(content);
    body.Type = type;

    console.log('body', body);
    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  exportDocumentToNewFileType(
    markdownID: string | undefined,
    name: string,
    content: string,
    type: string | undefined
  ): void {
    //Applying CSS stylings to html page to allow for table conversion
    const txtContent = content;
    const tableStyling = 'style="border-collapse: collapse; border:1px solid #bfbfbf;" ';
    const tdThStyling ='style="border: 1px solid #bfbfbf; padding: 8px; text-align: left; width:32px;" ';

    if(content.includes('<table')) {
      console.log('contains table');
    }
    //more work needs to be done to get conversion better
    //NB Try to use document selector to select by class and apply all relevant styling
    //See conversion to JPEG and PNG for details
    content = content.replace(/<table/g, `<table ${tableStyling}`);
    content = content.replace(/<td/g, `<td ${tdThStyling}`);
    content = content.replace(/<th/g, `<th ${tdThStyling}`);

    content = `<head><style>
    .text-huge {font-size: 1.8em;}
    .text-big {font-size: 1.4em;}
    .text-small {font-size: 0.85em;}
    .text-tiny {font-size: 0.7em;}
    figure {display: block;margin-block-start: 1em;margin-block-end: 1em;margin-inline-start: 40px;margin-inline-end: 40px;}
    .table {display: table;margin: 0.9em auto;}
    </style></head>` + content;
    console.log(content);

    let blob: Blob;
    let fileURL: string;
    let link: HTMLAnchorElement;

    switch (type) {
      case 'html':
        this.conversionService.downloadAsHtmlFile(content, name);

        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Export to html successful',
        });

        return;
      case 'pdf':
        this.conversionService.downloadAsPdfFile(content, name);

        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Export to pdf successful',
        });
        return;
      case 'txt':
        blob = this.conversionService.convertHtmlToPlainText(txtContent, type);

        // Download the File
        fileURL = URL.createObjectURL(blob);
        link = document.createElement('a');
        link.href = fileURL;
        link.download = name + '.' + type;
        link.click();
        URL.revokeObjectURL(fileURL);

        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Export to txt successful',
        });

        return;
      case 'md':
        blob = this.conversionService.convertHtmlToPlainText(txtContent, type);

        // Download the File
        fileURL = URL.createObjectURL(blob);
        link = document.createElement('a');
        link.href = fileURL;
        link.download = name + '.' + type;
        link.click();
        URL.revokeObjectURL(fileURL);

        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Export to md successful',
        });
        return;
      case 'jpeg':
        this.conversionService.convertHtmlToImage(content, name, type);
        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Export to jpeg successful',
        });
        return;
      case 'png':
        this.conversionService.convertHtmlToImage(content, name, type);
        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Export to png successful',
        });
        return;
    }
    this.messageService.add({
      severity: 'error',
      summary: 'Export failed',
    });

    // if (type === 'html') {
    //   this.downloadAsHtmlFile(content, name);
    //   return;
    // }
    // this.sendExportData(markdownID, name, content, type).subscribe({
    //   next: (response: HttpResponse<any>) => {
    //     if (response.status === 200) {
    //       const fileData: number[] = response.body.data;
    //       const uint8Array = new Uint8Array(fileData);
    //       const blob = new Blob([uint8Array], { type: 'application/pdf' });

    //       // Download the File
    //       const fileURL = URL.createObjectURL(blob);
    //       const link = document.createElement('a');
    //       link.href = fileURL;
    //       link.download = name + '.' + type;
    //       link.click();
    //       URL.revokeObjectURL(fileURL);

    //       // Show success message
    //       this.messageService.add({
    //         severity: 'success',
    //         summary: 'Export successful',
    //       });
    //     } else {
    //       this.messageService.add({
    //         severity: 'error',
    //         summary: 'Export failed',
    //       });
    //     }
    //   },
    // });
  }

  encryptDocument(content: string | undefined): string {
    if (content) return content;
    const key = this.userService.getEncryptionKey();
    if (key && content) {
      const encryptedMessage = CryptoJS.AES.encrypt(content, key).toString();
      return encryptedMessage;
    } else {
      return '';
    }
  }
  decryptDocument(content: string | undefined): string {
    if (content) return content;
    const key = this.userService.getEncryptionKey();
    if (key && content) {
      const decryptedMessage = CryptoJS.AES.decrypt(content, key)
        .toString(CryptoJS.enc.Utf8)
        .replace(/^"(.*)"$/, '$1');
      return decryptedMessage;
    } else {
      return '';
    }
  }
}
