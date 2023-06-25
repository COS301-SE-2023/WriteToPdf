import { Injectable } from '@angular/core';
import { MarkdownFileDTO } from './dto/markdown_file.dto';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from './user.service';
import { EditService } from './edit.service';
import { DirectoryFilesDTO } from './dto/directory_files.dto';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor(
    private http: HttpClient,
    private userService: UserService,
    private editService: EditService
  ) {}

  saveDocument(
    content: string | undefined,
    markdownID: string | undefined,
    path: string | undefined
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
    content: string | undefined,
    markdownID: string | undefined,
    path: string | undefined
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

  retrieveDocument(markdownID: string|undefined, path: string|undefined): Promise<any> {
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
    markdownID: string|undefined,
    path: string|undefined
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

  deleteDocument(markdownID: string | undefined): Promise<boolean> {
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

  sendDeleteData(markdownID: string | undefined): Observable<HttpResponse<any>> {
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

  renameDocument(fileName: string|undefined): Promise<boolean> {
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

  sendRenameData(name: string|undefined): Observable<HttpResponse<any>> {
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

  retrieveAllFiles(): Promise<MarkdownFileDTO[]> {
    return new Promise<MarkdownFileDTO[]>((resolve, reject) => {
      this.sendRetrieveAllFiles().subscribe({
        next: (response: HttpResponse<any>) => {

          if (response.status === 200) {
            console.log('Retrieve successful');
            const body = response.body;
            console.log("" + body);
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
            console.log('Retrieve failed');
            reject();
          }
        },
        error: (error) => {
          console.log('Retrieve failed');
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
}
