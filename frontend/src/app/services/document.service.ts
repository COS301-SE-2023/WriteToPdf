import { Injectable } from '@angular/core';
import { MarkdownFileDTO } from './dto/markdown_file.dto';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from './user.service';


@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor(private http: HttpClient, private userService: UserService) { }

  saveDocument(content: string) {
    console.log('saveDocument() called');
  }

  sendSaveData(content: string): Observable<HttpResponse<any>> {
    const url = 'http://localhost:3000/file_manager/save_file';
    const body = new MarkdownFileDTO();
    
    body.UserID=this.userService.getUserID();
    body.Content = content;

    const headers = new HttpHeaders().set('Authorization', 'Bearer '+this.userService.getAuthToken());
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  retrieveDocument() {

  }

  createDocument(): Observable<HttpResponse<any>> {
    const url = 'http://localhost:3000/file_manager/create_file';
    const body = new MarkdownFileDTO();

    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.userService.getAuthToken());
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  sendRetrieveData(): Observable<HttpResponse<any>> {
    const url = 'http://localhost:3000/file_manager/retrieve_file';
    const body = new MarkdownFileDTO();

    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.userService.getAuthToken());
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  deleteDocument() {

  }

  sendDeleteData(): Observable<HttpResponse<any>> {
    const url = 'http://localhost:3000/file_manager/delete_file';
    const body = new MarkdownFileDTO();

    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.userService.getAuthToken());
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  renameDocument() {

  }

  sendRenameData(name:string): Observable<HttpResponse<any>> {
    const url = 'http://localhost:3000/file_manager/rename_file';
    const body = new MarkdownFileDTO();

    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.userService.getAuthToken());
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  moveDocument() {

  }

  sendMoveData(path:string): Observable<HttpResponse<any>> {
    const url = 'http://localhost:3000/file_manager/move_file';
    const body = new MarkdownFileDTO();

    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.userService.getAuthToken());
    return this.http.post(url, body, { headers, observe: 'response' });
  }

}
