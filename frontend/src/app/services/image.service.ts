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
  providedIn: 'root'
})
export class ImageService {

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private messageService: MessageService
  ) { }

  uploadImage(content: string | undefined, path: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sendUploadImageData(content, path).subscribe({
        next: (response: HttpResponse<any>) => {

          if (response.status === 200) {
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

  sendUploadImageData(content: string | undefined, path: string): Observable<HttpResponse<any>> {

    const environmentURL = environment.apiURL;
    const url = `${environmentURL}image_manager/upload`;
    const body = new ImageDTO();

    body.UserID = this.userService.getUserID();
    body.Content = content;
    body.Path = path;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

}
