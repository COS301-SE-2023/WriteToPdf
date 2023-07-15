import { Injectable } from '@angular/core';
import { ImageDTO } from '../services/dto/image.dto';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from './user.service';
import { MessageService } from 'primeng/api';
import { environment } from '../../environments/environment';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  constructor(
    private http: HttpClient,
    private userService: UserService,
    private messageService: MessageService
  ) {}

  uploadImage(content: string | undefined, path: string, fileName:string): Promise<boolean> {
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
    fileName:string
  ): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}image_manager/upload`;
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

  retrieveImage(path: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.sendRetrieveImageData(path).subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.status === 200) {
            console.log('Image retrieved successfully');
            resolve(response.body.Content);
          } else {
            resolve('');
          }
        },
      });
    });
  }

  sendRetrieveImageData(path: string): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}image_manager/retrieve`;
    const body = new ImageDTO();

    body.UserID = this.userService.getUserID();
    body.Path = path;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }
}
