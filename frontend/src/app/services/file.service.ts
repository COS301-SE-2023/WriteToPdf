import { Injectable } from '@angular/core';
import { MarkdownFileDTO } from './dto/markdown_file.dto';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from './user.service';
import { EditService } from './edit.service';
import { DirectoryFilesDTO } from './dto/directory_files.dto';
import { ImportDTO } from './dto/import.dto';
import { resolve } from 'path';
import { ExportDTO } from './dto/export.dto';
import { MessageService } from 'primeng/api';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor(
    private http: HttpClient,
    private userService: UserService,
    private editService: EditService,
    private messageService: MessageService
  ) {}

  saveDocument(
    content: string | undefined,
    markdownID: string | undefined,
    path: string | undefined
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sendSaveData(content, markdownID, path).subscribe({
        next: (response: HttpResponse<any>) => {
          console.log('SAVE');
          console.log(response);
          console.log(response.status);

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
    const url = 'http://localhost:3000/file_manager/save_file';
    const body = new MarkdownFileDTO();

    body.UserID = this.userService.getUserID();
    body.Content = this.encryptDocument(JSON.stringify(content));
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
    const url = 'http://localhost:3000/file_manager/retrieve_file';
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
          console.log(response);
          console.log(response.status);

          if (response.status === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'File created successfully',
            });

            this.editService.setMarkdownID(response.body.MarkdownID);
            this.editService.setPath(response.body.Path);
            this.editService.setName(response.body.Name);
            this.editService.setParentFolderID(response.body.ParentFolderID);
            this.editService.setContent('');

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
    const url = 'http://localhost:3000/file_manager/create_file';
    const body = new MarkdownFileDTO();

    body.UserID = this.userService.getUserID();
    body.Path = path;
    body.Name = name;
    body.ParentFolderID = parentFolderID;

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
          console.log(response.status);

          if (response.status === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'File deleted successfully',
            });
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
    const url = 'http://localhost:3000/file_manager/delete_file';
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
          console.log(response);
          console.log(response.status);

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
    const url = 'http://localhost:3000/file_manager/rename_file';
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
          console.log(response);
          console.log(response.status);

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
    const url = 'http://localhost:3000/file_manager/move_file';
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
            console.log('' + body);
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
    const url = 'http://localhost:3000/file_manager/retrieve_all_files';
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
          console.log(response);
          console.log(response.status);
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
    const url = 'http://localhost:3000/file_manager/import';
    const body = new ImportDTO();

    body.UserID = this.userService.getUserID();
    body.Path = path;
    body.Name = name;
    body.ParentFolderID = parentFolderID;
    body.Content = this.encryptDocument(content);
    body.Type = type;

    console.log('Body Import: ' + JSON.stringify(body));
    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  exportDocument(
    markdownID: string,
    name: string,
    content: string,
    type: string
  ): void {
    this.sendExportData(markdownID, name, content, type).subscribe({
      next: (response: HttpResponse<any>) => {
        console.log(response);
        console.log(response.status);
        if (response.status === 200) {
          this.messageService.add({
            severity: 'success',
            summary: 'Export successful',
          });
          const fileContent = this.decryptDocument(response.body.Content);
          const fileName = response.body.Name;
          const fileType = response.body.Type;
          const downloadURL = URL.createObjectURL(
            new Blob([fileContent], { type: 'text/plain' })
          );
          const downloadLink = document.createElement('a');
          downloadLink.href = downloadURL;
          downloadLink.download = fileName + '.' + fileType;
          downloadLink.click();
          URL.revokeObjectURL(downloadURL);
          // document.body.removeChild(downloadLink);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Export failed',
          });
        }
      },
    });
  }

  sendExportData(
    markdownID: string | undefined,
    name: string | undefined,
    content: string | undefined,
    type: string | undefined
  ): Observable<HttpResponse<any>> {
    const url = 'http://localhost:3000/file_manager/export';
    const body = new ExportDTO();

    body.MarkdownID = markdownID;
    body.Name = name;
    body.Content = this.encryptDocument(content);
    body.UserID = this.userService.getUserID();
    body.Type = type;

    console.log('Export body.Content: ' + body.Content);

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  encryptDocument(content: string | undefined): string {
    // console.log('content fileService 481: ' + content);
    const key = this.userService.getEncryptionKey();
    if (key && content) {
      content = JSON.stringify(content);
      const encryptedMessage = CryptoJS.AES.encrypt(content, key).toString();
      return encryptedMessage;
    } else {
      return '';
    }
  }

  decryptDocument(content: string | undefined): string {
    const key = this.userService.getEncryptionKey();
    if (key && content) {
      const decryptedMessage = CryptoJS.AES.decrypt(content, key).toString(
        CryptoJS.enc.Utf8
      ).replace(/^"(.*)"$/, '$1');
      return decryptedMessage;
    } else {
      return '';
    }
  }
}
