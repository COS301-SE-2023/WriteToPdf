import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { VersionSetDTO } from './dto/version_set.dto';
import { UserService } from './user.service';
import { DiffDTO } from './dto/diff.dto';
import { SnapshotDTO } from './dto/snapshot.dto';
import { MarkdownFileDTO } from './dto/markdown_file.dto';

@Injectable({
  providedIn: 'root',
})
export class VersioningApiService {
  constructor(private http: HttpClient, private userService: UserService) {}

  saveDiff(fileID: string, content: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sendSaveDiff(fileID, content).subscribe({
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

  sendSaveDiff(
    markdownID: string,
    content: string
  ): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}version_control/save_diff`;
    console.log(url);
    const body = new DiffDTO();

    body.UserID = this.userService.getUserID() as number;
    body.Content = content;
    body.MarkdownID = markdownID;
    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    console.log(body);
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  retrieveAllSnapshots(markdownID: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.sendRetrieveAllSnapshots(markdownID).subscribe({
        next: (response: HttpResponse<any>) => {
          console.log(response);
          if (response.status === 200) {
            resolve(response.body);
          } else {
            resolve(null);
          }
        },
      });
    });
  }

  sendRetrieveAllSnapshots(markdownID: string): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}version_control/get_all_snapshots`;
    console.log(url);
    const body = new SnapshotDTO();

    body.UserID = this.userService.getUserID() as number;
    body.MarkdownID = markdownID;
    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  retrieveAllHistory(markdownID: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.sendRetrieveAllHistory(markdownID).subscribe({
        next: (response: HttpResponse<any>) => {
          console.log('Backend data response: ', response);
          if (response.status === 200) {
            resolve(response.body);
          } else {
            resolve(null);
          }
        },
      });
    });
  }

  sendRetrieveAllHistory(markdownID: string): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}version_control/load_history`;
    console.log(url);
    const body = new MarkdownFileDTO();

    body.UserID = this.userService.getUserID() as number;
    body.MarkdownID = markdownID;
    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  loadHistorySet(
    markdownID: string,
    diffHistory: string[],
    snapshotID: string,
    snapshotIndex: number,
    latestSnapshot: boolean
  ) {
    return new Promise<any>((resolve, reject) => {
      this.sendLoadHistorySet(
        markdownID,
        diffHistory,
        snapshotID,
        snapshotIndex,
        latestSnapshot
      ).subscribe({
        next: (response: HttpResponse<any>) => {
          console.log(response);
          if (response.status === 200) {
            resolve(response.body);
          } else {
            resolve(null);
          }
        },
      });
    });
  }

  sendLoadHistorySet(
    markdownID: string,
    diffHistory: string[],
    snapshotID: string,
    snapshotIndex: number,
    latestSnapshot: boolean
  ): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}version_control/get_history_set`;
    const body = new VersionSetDTO();

    body.UserID = this.userService.getUserID() as number;
    body.MarkdownID = markdownID;
    body.DiffHistory = diffHistory;
    body.SnapshotID = snapshotID;
    body.IsHeadSnapshot = snapshotIndex === 0;
    body.IsLatestSnapshot = latestSnapshot;

    console.log('versioning-api.sendLoadHistorySet: ', body);
    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  getSnapshotContent(snapshot: any) {
    return new Promise<any>((resolve) => {
      this.sendGetSnapshotContent(snapshot).subscribe({
        next: (response: HttpResponse<any>) => {
          console.log(response);
          if (response.status === 200) {
            resolve(response.body);
          } else {
            resolve(null);
          }
        },
      });
    });
  }

  sendGetSnapshotContent(snapshot: any): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}version_control/get_snapshot`;
    const body = new SnapshotDTO();

    body.UserID = this.userService.getUserID() as number;
    body.MarkdownID = snapshot.MarkdownID;
    body.S3SnapshotIndex = snapshot.S3SnapshotIndex;

    console.log('versioning-api.sendGetSnapshotContent: ', body);

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }
}
