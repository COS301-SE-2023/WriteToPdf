import { Injectable } from '@angular/core';
import { ImageDTO } from '../services/dto/image.dto';
import { AssetDTO } from '../services/dto/asset.dto';
import { RetrieveAllDTO } from '../services/dto/retrieve_all.dto';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from './user.service';
import { MessageService } from 'primeng/api';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  constructor(
    private http: HttpClient,
    private userService: UserService,
    private messageService: MessageService
  ) { }

  uploadImage(content: string | undefined, path: string, fileName: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sendUploadImageData(content, path, fileName).subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.status === 201) {
            console.log('Image uploaded successfully');
            this.messageService.add({
              severity: 'success',
              summary: 'Image uploaded successfully',
            });
            resolve(true);
          } else {
            resolve(false);
          }
        },
      });
    });
  }

  sendUploadImageData(
    content: string | undefined,
    path: string,
    fileName: string
  ): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}asset_manager/upload_image`;
    const body = new ImageDTO();

    body.UserID = this.userService.getUserID();
    body.Content = content;
    body.Path = path;
    body.FileName = fileName;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  retrieveAsset(assetId: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.sendRetrieveAssetData(assetId).subscribe({
        next: (response: HttpResponse<any>) => {
          console.log(response);
          if (response.status === 200) {
            console.log('Image retrieved successfully');
            resolve(response.body);
          } else {
            resolve(null);
          }
        },
      });
    });
  }

  sendRetrieveAssetData(assetId: string): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}asset_manager/retrieve_one`;
    const body = new AssetDTO();

    body.UserID = this.userService.getUserID();
    body.AssetID = assetId;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }


  retrieveAll(): Promise<any[]> {
    console.log('Retrieving all images');
    return new Promise<any[]>((resolve, reject) => {
      this.sendRetrieveAllData().subscribe({
        next: (response: HttpResponse<any>) => {
          console.log(response);
          if (response.status === 200) {
            console.log('Images retrieved successfully');
            console.log(response.body.Content);
            resolve(response.body);
          } else {
            resolve([]);
          }
        },
      });
    });
  }

  sendRetrieveAllData(): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}asset_manager/retrieve_all`;
    const body = new RetrieveAllDTO();

    body.UserID = this.userService.getUserID();

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  deleteAsset(assetId: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sendDeleteAssetData(assetId).subscribe({
        next: (response: HttpResponse<any>) => {
          console.log("DELETE: " + JSON.stringify(response));
          if (response.status === 200) {
            console.log('Image deleted successfully');
            resolve(true);
          } else {
            resolve(false);
          }
        },
      });
    });
  }

  sendDeleteAssetData(assetId: string): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}asset_manager/delete_asset`;
    const body = new AssetDTO();

    body.UserID = this.userService.getUserID();
    body.AssetID = assetId;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  renameAsset(assetId: string, newName: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sendRenameAssetData(assetId, newName).subscribe({
        next: (response: HttpResponse<any>) => {
          console.log(response);
          if (response.status === 200) {
            console.log('Image renamed successfully');
            resolve(true);
          } else {
            resolve(false);
          }
        },
      });
    });
  }

  sendRenameAssetData(assetId: string, newName: string): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}asset_manager/rename_asset`;
    const body = new AssetDTO();

    body.UserID = this.userService.getUserID();
    body.AssetID = assetId;
    body.FileName = newName;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }
}
