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

}
