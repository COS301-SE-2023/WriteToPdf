import { Injectable } from '@angular/core';
import { FolderDTO } from './dto/folder.dto';
import { DirectoryFilesDTO } from './dto/directory_files.dto';
import { DirectoryFoldersDTO } from './dto/directory_folders.dto';
import { UserService } from './user.service';
import { HttpResponse } from '@angular/common/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FolderService {
  constructor(
    private userService: UserService,
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  moveFolder(
    folderID: string | undefined,
    path: string | undefined,
    parentFolderID: string | undefined
  ): Promise<FolderDTO> {
    return new Promise<FolderDTO>((resolve, reject) => {
      this.sendMoveData(folderID, path, parentFolderID).subscribe({
        next: (response: HttpResponse<any>) => {

          if (response.status === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'Folder moved successfully',
            });
            const folder = new FolderDTO();
            folder.FolderID = response.body.FolderID;
            folder.DateCreated = response.body.DateCreated;
            folder.LastModified = response.body.LastModified;
            folder.ParentFolderID = response.body.ParentFolderID;
            folder.Path = response.body.Path;
            folder.ParentFolderID = response.body.ParentFolderID;

            resolve(folder);
          } else {
            reject();
          }
        },
      });
    });
  }

  sendMoveData(
    folderID: string | undefined,
    path: string | undefined,
    parentFolderID: string | undefined
  ): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}file_manager/move_folder`;
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
          
          if (response.status === 200) {

            resolve(true);
          } else {
            resolve(false);
          }
        },
      });
    });
  }

  sendDeleteData(folderID: string | undefined): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}file_manager/delete_folder`;
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
            let folders: FolderDTO[] = [];
            for (let i = 0; i < body.Folders.length; i++) {
              const folderDTO = new FolderDTO();
              folderDTO.FolderID = body.Folders[i].FolderID;
              folderDTO.DateCreated = body.Folders[i].DateCreated;
              folderDTO.LastModified = body.Folders[i].LastModified;
              folderDTO.FolderName = body.Folders[i].FolderName;
              folderDTO.Path = body.Folders[i].Path;
              folderDTO.ParentFolderID = body.Folders[i].ParentFolderID;
              folders.push(folderDTO);
            }

            resolve(folders);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error retrieving folders',
            });
            reject();
          }
        },
        error: (error) => {
          reject();
        },
      });
    });
  }

  sendRetrieveAllFolders(): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}file_manager/retrieve_all_folders`;
    const body = new DirectoryFoldersDTO();

    body.UserID = this.userService.getUserID();

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  createFolder(
    path: string | undefined,
    folderName: string,
    parentFolderID: string | undefined
  ): Promise<FolderDTO> {
    return new Promise<FolderDTO>((resolve, reject) => {
      this.sendCreateData(path, folderName, parentFolderID).subscribe({
        next: (response: HttpResponse<any>) => {

          if (response.status === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'Folder created successfully',
            });
            const folder = new FolderDTO();
            folder.FolderName = folderName;
            folder.Path = path;
            folder.ParentFolderID = parentFolderID;
            folder.FolderID = response.body.FolderID;
            resolve(folder);
          } else {
            reject();
          }
        },
      });
    });
  }

  sendCreateData(
    path: string | undefined,
    folderName: string,
    parentFolderID: string | undefined
  ): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}file_manager/create_folder`;

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

  renameFolder(
    folderID: string | undefined,
    path: string | undefined,
    folderName: string
  ): Promise<boolean> {
    // console.log(folderID+" "+path+" "+folderName);
    return new Promise<boolean>((resolve, reject) => {
      this.sendRenameData(folderID, path, folderName).subscribe({
        next: (response: HttpResponse<any>) => {
          // console.log(response);
          if (response.status === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'Folder renamed successfully',
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
    folderID: string | undefined,
    path: string | undefined,
    folderName: string
  ): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}file_manager/rename_folder`;

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
