import { Injectable } from '@angular/core';
import { UserService } from './user.service';
// import DiffMatchPatch from 'diff-match-patch';
import { diff_match_patch as DiffMatchPatch } from 'diff-match-patch';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DiffDTO } from './dto/diff.dto';
import { SnapshotDTO } from './dto/snapshot.dto';
import { MarkdownFileDTO } from './dto/markdown_file.dto';

import { FileService } from './file.service';
import { VersionDTO } from './dto/version.dto';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VersionControlService {
  constructor(private http: HttpClient, private fileService: FileService, private userService: UserService) { }

  public snapshotArr: SnapshotDTO[] = [];
  public diffArr: DiffDTO[] = [];
  public versionArr: VersionDTO[] = [];
  private DiffPatchService = new DiffMatchPatch();

  // async test(): Promise<void> {
  //   let text1: string = '';
  //   let text2: string = '';
  //   const filePath1 = '../assets/VersionControl/test1.txt';
  //   const filePath2 = '../assets/VersionControl/test2.txt';
  //   this.http.get(filePath1, { responseType: 'text' }).subscribe((data) => {
  //     text1 = data;
  //     this.http.get(filePath2, { responseType: 'text' }).subscribe((data) => {
  //       text2 = data;

  //       const diff = this.DiffPatchService.diff_main(text1, text2);
  //       const patches = this.DiffPatchService.patch_make(diff);
  //       console.log(this.DiffPatchService.patch_toText(patches));
  //       console.log(this.DiffPatchService.patch_apply(patches, text1));
  //     });
  //   });
  // }

  async init(): Promise<void> {
    // TODO: Un-hijack login
    this.snapshotArr = [];
    this.diffArr = [];
    this.versionArr = [];

    let text1: string = '';
    let text2: string = '';
    const diffPathArr: string[] = [];
    diffPathArr.push('../assets/MockData/VersionControl/abc123_d1');
    diffPathArr.push('../assets/MockData/VersionControl/abc123_d2');
    diffPathArr.push('../assets/MockData/VersionControl/abc123_d3');
    diffPathArr.push('../assets/MockData/VersionControl/abc123_d4');

    const snapshotPathArr: string[] = [];
    snapshotPathArr.push('../assets/MockData/VersionControl/abc123_s0');

    for (let element of snapshotPathArr) {
      this.http.get(element, { responseType: 'text' }).subscribe((data) => {
        var tempDTO = new SnapshotDTO();
        tempDTO.MarkdownID = 'abc123';
        tempDTO.SnapshotNumber = +element.charAt(element.length - 1);
        tempDTO.Content = data;
        this.pushToSnapshotArr(tempDTO);
      });
    }

    for (let element of diffPathArr) {
      this.http.get(element, { responseType: 'text' }).subscribe((data) => {
        var tempDTO = new DiffDTO();
        tempDTO.MarkdownID = 'abc123';
        tempDTO.DiffNumber = +element.charAt(element.length - 1);
        tempDTO.SnapshotNumber = this.snapshotArr[0].SnapshotNumber;
        tempDTO.Content = data;
        this.pushToDiffArr(tempDTO);
      });
    }

    await new Promise((f) => setTimeout(f, 10));

    this.visualise();
  }

  getDiffArr(): DiffDTO[] {
    return this.diffArr;
  }

  pushToDiffArr(element: DiffDTO): DiffDTO[] {
    this.diffArr.push(element);
    return this.diffArr;
  }

  getSnapshotArr(): SnapshotDTO[] {
    return this.snapshotArr;
  }

  pushToSnapshotArr(element: SnapshotDTO): SnapshotDTO[] {
    this.snapshotArr.push(element);
    return this.snapshotArr;
  }

  sortSnapshotArr(inArr: SnapshotDTO[]): void {
    // Ascending sort on snapshotNumber
    inArr.sort((a, b) =>
      a.SnapshotNumber > b.SnapshotNumber
        ? 1
        : a.SnapshotNumber < b.SnapshotNumber
          ? -1
          : 0
    );
  }

  sortDiffArr(inArr: DiffDTO[]): void {
    // Ascending sort on diffNumber
    inArr.sort((a, b) =>
      a.DiffNumber > b.DiffNumber ? 1 : a.DiffNumber < b.DiffNumber ? -1 : 0
    );
  }

  visualise(): void {
    // Build snapshot version
    for (let element of this.snapshotArr) {
      this.versionArr.push(this.buildSnapshotVersion(element));
    }

    // Build diff version
    for (let element of this.diffArr) {
      this.versionArr.push(this.buildDiffVersion(element, this.snapshotArr[0]));
    }

    // Visualise snapshot
    const snapshotVersions = this.versionArr.filter((ele) => {
      return !ele.IsDiff;
    });
    console.log(snapshotVersions);

    //Visualise diff
    const diffVersions = this.versionArr.filter((ele) => {
      return ele.IsDiff;
    });

    // Could optimise by saving pretty html somewhere on save
    for (let element of diffVersions) {
      let dpsDiff = this.DiffPatchService.diff_main(
        element.PrevContent,
        element.Content
      );
      console.log(this.DiffPatchService.diff_prettyHtml(dpsDiff));
    }
  }

  buildSnapshotVersion(snapshot: SnapshotDTO): VersionDTO {
    const tempDTO = new VersionDTO();

    tempDTO.Content = snapshot.Content;
    tempDTO.IsDiff = false;
    tempDTO.MarkdownID = snapshot.MarkdownID;
    tempDTO.PrevContent = '';

    return tempDTO;
  }

  buildDiffVersion(diff: DiffDTO, snapshot: SnapshotDTO): VersionDTO {
    const tempDTO = new VersionDTO();

    tempDTO.IsDiff = true;
    tempDTO.MarkdownID = diff.MarkdownID;
    tempDTO.PrevContent = this.buildDiffContext(diff, snapshot);

    const patches = this.DiffPatchService.patch_fromText(diff.Content);
    tempDTO.Content = this.DiffPatchService.patch_apply(
      patches,
      tempDTO.PrevContent
    )[0];

    return tempDTO;
  }

  buildDiffContext(diff: DiffDTO, snapshot: SnapshotDTO): string {
    let retString = snapshot.Content;

    const tempArr = this.diffArr.filter((ele) => {
      return ele.DiffNumber < diff.DiffNumber;
    });

    this.sortDiffArr(tempArr);

    for (let element of tempArr) {
      let patches = this.DiffPatchService.patch_fromText(element.Content);
      retString = this.DiffPatchService.patch_apply(patches, retString)[0];
    }

    return retString;
  }

  getReadablePatch(text1: string, text2: string): string {
    const dpsDiff = this.DiffPatchService.diff_main(text1, text2);
    const patches = this.DiffPatchService.patch_make(dpsDiff);
    return this.DiffPatchService.patch_toText(patches);
  }

  snapshotRestore(snapshot: SnapshotDTO): void {
    this.snapshotArr = this.snapshotArr.filter((ele) => {
      return ele.SnapshotNumber <= snapshot.SnapshotNumber;
    });

    this.diffArr = this.diffArr.filter((ele) => {
      return ele.SnapshotNumber <= snapshot.SnapshotNumber;
    });

    this.sortSnapshotArr(this.snapshotArr);
    this.sortDiffArr(this.diffArr);
  }

  diffRestore(diff: DiffDTO): void {
    this.snapshotArr = this.snapshotArr.filter((ele) => {
      return ele.SnapshotNumber <= diff.SnapshotNumber;
    });

    this.diffArr = this.diffArr.filter((ele) => {
      return ele.SnapshotNumber <= diff.SnapshotNumber;
    });

    this.sortSnapshotArr(this.snapshotArr);
    this.sortDiffArr(this.diffArr);
  }

  saveDiff(fileID: string, content: string, snapshotPayload:string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sendSaveDiff(fileID, content, snapshotPayload).subscribe({
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

  sendSaveDiff(markdownID: string, content: string, snapshotPayload:string): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}version_control/save_diff`;
    console.log(url);
    const body = new DiffDTO();

    body.UserID = this.userService.getUserID() as number;
    body.Content = content;
    body.MarkdownID = markdownID;
    body.SnapshotPayload = snapshotPayload;
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
}
