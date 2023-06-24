import { Injectable } from '@angular/core';
import { MarkdownFileDTO } from './dto/markdown_file.dto';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from './user.service';
import { EditService } from './edit.service';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  constructor(
    private http: HttpClient,
    private userService: UserService,
    private editService: EditService
  ) {}

  saveDocument(
    content: string,
    markdownID: string,
    path: string
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sendSaveData(content, markdownID, path).subscribe({
        next: (response: HttpResponse<any>) => {
          console.log(response);
          console.log(response.status);

          if (response.status === 200) {
            console.log('Save successful');
            resolve(true);
          } else {
            resolve(false);
          }
        },
      });
    });
  }

  sendSaveData(
    content: string,
    markdownID: string,
    path: string
  ): Observable<HttpResponse<any>> {
    const url = 'http://localhost:3000/file_manager/save_file';
    const body = new MarkdownFileDTO();

    body.UserID = this.userService.getUserID();
    body.Content = content;
    body.MarkdownID = markdownID;
    body.Path = path;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  retrieveDocument(markdownID: string, path: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.sendRetrieveData(markdownID, path).subscribe({
        next: (response: HttpResponse<any>) => {
          console.log(response);
          console.log(response.status);

          if (response.status === 200) {
            console.log('Retrieve successful');
            resolve(response.body.Content);
          } else {
            resolve(false);
          }
        },
      });
    });
  }

  sendRetrieveData(
    markdownID: string,
    path: string
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

  createDocument(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sendCreateData().subscribe({
        next: (response: HttpResponse<any>) => {
          console.log(response);
          console.log(response.status);

          if (response.status === 200) {
            console.log('Create successful');

            this.editService.setMarkdownID(response.body.MarkdownID);
            this.editService.setPath(response.body.Path);
            this.editService.setName(response.body.Name);
            this.editService.setParentFolderID(response.body.ParentFolderID);

            resolve(true);
          } else {
            resolve(false);
          }
        },
      });
    });
  }

  sendCreateData(): Observable<HttpResponse<any>> {
    const url = 'http://localhost:3000/file_manager/create_file';
    const body = new MarkdownFileDTO();

    body.UserID = this.userService.getUserID();
    body.Path = '';
    body.Name = 'New Document';
    body.ParentFolderID = '1 ';

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  deleteDocument(markdownID: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sendDeleteData(markdownID).subscribe({
        next: (response: HttpResponse<any>) => {
          console.log(response);
          console.log(response.status);

          if (response.status === 200) {
            console.log('Delete successful');
            resolve(true);
          } else {
            resolve(false);
          }
        },
      });
    });
  }

  sendDeleteData(markdownID: string): Observable<HttpResponse<any>> {
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

  renameDocument(fileName: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sendRenameData(fileName).subscribe({
        next: (response: HttpResponse<any>) => {
          console.log(response);
          console.log(response.status);

          if (response.status === 200) {
            console.log('Rename successful');
            resolve(true);
          } else {
            resolve(false);
          }
        },
      });
    });
  }

  sendRenameData(name: string): Observable<HttpResponse<any>> {
    const url = 'http://localhost:3000/file_manager/rename_file';
    const body = new MarkdownFileDTO();

    body.UserID = this.userService.getUserID();
    body.Path = this.editService.getPath();
    body.MarkdownID = this.editService.getMarkdownID();
    body.Name = name;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  moveDocument(path: string, markdownID: string, ParentFolderID: string) {
    // Will need to rerun directory structure function with new moved file.
    return new Promise<boolean>((resolve, reject) => {
      this.sendMoveData(path, markdownID, ParentFolderID).subscribe({
        next: (response: HttpResponse<any>) => {
          console.log(response);
          console.log(response.status);

          if (response.status === 200) {
            console.log('Move successful');
            resolve(true);
          } else {
            resolve(false);
          }
        },
      });
    });
  }

  sendMoveData(
    path: string,
    markdownID: string,
    ParentFolderID: string
  ): Observable<HttpResponse<any>> {
    const url = 'http://localhost:3000/file_manager/move_file';
    const body = new MarkdownFileDTO();

    body.UserID = this.userService.getUserID();
    body.Path = path;
    body.MarkdownID = markdownID;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }
}
