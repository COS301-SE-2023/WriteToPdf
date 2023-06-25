import { Injectable } from '@angular/core';
import { FolderDTO } from './dto/folder.dto';
import { DirectoryFilesDTO } from './dto/directory_files.dto';
import { DirectoryFoldersDTO } from './dto/directory_folders.dto';
import { UserService } from './user.service';
import { HttpResponse } from '@angular/common/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FolderService {

  constructor(private userService:UserService, private http: HttpClient) { }

  moveFolder(folderID: string, path: string, parentFolderID: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sendMoveData(folderID, path, parentFolderID).subscribe({
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
    folderID: string,
    path: string,
    parentFolderID: string
  ): Observable<HttpResponse<any>> {
    const url = 'http://localhost:3000/file_manager/move_folder';
    const body = new FolderDTO();

    body.UserID = this.userService.getUserID();
    body.Path = path;
    body.FolderID = folderID;
    body.ParentFolderID = parentFolderID;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  deleteFolder(folderID: string | undefined): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sendDeleteData(folderID).subscribe({
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

  sendDeleteData(folderID: string | undefined): Observable<HttpResponse<any>> {
    const url = 'http://localhost:3000/file_manager/delete_folder';
    const body = new FolderDTO();

    body.UserID = this.userService.getUserID();
    body.Path = '';
    body.FolderID = folderID;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  retrieveAllFolders(): Promise<FolderDTO[]> {
    return new Promise<FolderDTO[]>((resolve, reject) => {
      this.sendRetrieveAllFolders().subscribe({
        next: (response: HttpResponse<any>) => {

          if (response.status === 200) {
            const body = response.body;
            console.log(body);
            let folders: FolderDTO[] = [];
            for (let i = 0; i < body.Folders.length; i++) {
              const folderDTO = new FolderDTO();
              folderDTO.FolderID = body.Folder[i].FolderID;
              folderDTO.DateCreated = body.Folder[i].DateCreated;
              folderDTO.LastModified = body.Folder[i].LastModified;
              folderDTO.FolderName = body.Folder[i].FolderName;
              folderDTO.Path = body.Folder[i].Path;
              folderDTO.ParentFolderID = body.Folder[i].ParentFolderID;
              folders.push(folderDTO);
            }

            resolve(folders);
          } else {
            console.log('Retrieve unsuccessful');
            reject();
          }
        },
        error: (error) => {
          console.log(error);
          reject();
        }
      });
    });
  }

  sendRetrieveAllFolders(): Observable<HttpResponse<any>> {
    const url = 'http://localhost:3000/file_manager/retrieve_all_folders';
    const body = new DirectoryFoldersDTO();

    body.UserID = this.userService.getUserID();

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  createFolder(path: string, folderName: string, parentFolderID: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sendCreateData(path, folderName, parentFolderID).subscribe({
        next: (response: HttpResponse<any>) => {
          console.log(response);
          console.log(response.status);

          if (response.status === 200) {
            console.log('Create successful');
            resolve(true);
          } else {
            resolve(false);
          }
        },
      });
    });
  }

  sendCreateData(path:string, folderName:string, parentFolderID:string): Observable<HttpResponse<any>> {
    const url = 'http://localhost:3000/file_manager/create_folder';
    const body = new FolderDTO();

    body.UserID = this.userService.getUserID();
    body.Path = path;
    body.FolderName = folderName;
    body.ParentFolderID = parentFolderID;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  renameFolder(folderID: string, path: string, folderName: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sendRenameData(folderID, path, folderName).subscribe({
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

  sendRenameData(folderID: string, path: string, folderName: string): Observable<HttpResponse<any>> {
    const url = 'http://localhost:3000/file_manager/rename_folder';
    const body = new FolderDTO();

    body.UserID = this.userService.getUserID();
    body.Path = path;
    body.FolderID = folderID;
    body.FolderName = folderName;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

}
