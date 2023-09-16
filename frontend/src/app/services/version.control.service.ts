import { Injectable } from '@angular/core';
import { UserService } from './user.service';
// import DiffMatchPatch from 'diff-match-patch';
import { Diff, diff_match_patch as DiffMatchPatch } from 'diff-match-patch';
import { HttpClient } from '@angular/common/http';
import { DiffDTO } from './dto/diff.dto';
import { SnapshotDTO } from './dto/snapshot.dto';
import { FileDTO } from './dto/file.dto';

import { FileService } from './file.service';
import { VersionDTO } from './dto/version.dto';

@Injectable({
  providedIn: 'root',
})
export class VersionControlService {
  constructor(private http: HttpClient, private fileService: FileService) {}

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
        tempDTO.fileID = 'abc123';
        tempDTO.snapshotNumber = +element.charAt(element.length - 1);
        tempDTO.content = data;
        this.pushToSnapshotArr(tempDTO);
      });
    }

    for (let element of diffPathArr) {
      this.http.get(element, { responseType: 'text' }).subscribe((data) => {
        var tempDTO = new DiffDTO();
        tempDTO.fileID = 'abc123';
        tempDTO.diffNumber = +element.charAt(element.length - 1);
        tempDTO.snapshotNumber = this.snapshotArr[0].snapshotNumber;
        tempDTO.content = data;
        this.pushToDiffArr(tempDTO);
      });
    }

    await new Promise((f) => setTimeout(f, 10));

    this.visualise();
  }

  getDiffArr(): DiffDTO[] {
    return this.diffArr;
  }

  setDiffArr(inArr: DiffDTO[]): DiffDTO[] {
    this.diffArr = inArr;
    return this.diffArr;
  }

  pushToDiffArr(element: DiffDTO): DiffDTO[] {
    this.diffArr.push(element);
    return this.diffArr;
  }

  getSnapshotArr(): SnapshotDTO[] {
    return this.snapshotArr;
  }

  setSnapshotArr(inArr: SnapshotDTO[]): SnapshotDTO[] {
    this.snapshotArr = inArr;
    return this.snapshotArr;
  }

  pushToSnapshotArr(element: SnapshotDTO): SnapshotDTO[] {
    this.snapshotArr.push(element);
    return this.snapshotArr;
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
      return !ele.isDiff;
    });
    console.log(snapshotVersions);

    //Visualise diff
    const diffVersions = this.versionArr.filter((ele) => {
      return ele.isDiff;
    });

    // Could optimise by saving pretty html somewhere on save
    for (let element of diffVersions) {
      let dpsDiff = this.DiffPatchService.diff_main(
        element.prevContent,
        element.content
      );
      console.log(this.DiffPatchService.diff_prettyHtml(dpsDiff));
    }
  }

  buildSnapshotVersion(snapshot: SnapshotDTO): VersionDTO {
    const tempDTO = new VersionDTO();

    tempDTO.content = snapshot.content;
    tempDTO.isDiff = false;
    tempDTO.fileID = snapshot.fileID;
    tempDTO.prevContent = '';

    return tempDTO;
  }

  buildDiffVersion(diff: DiffDTO, snapshot: SnapshotDTO): VersionDTO {
    const tempDTO = new VersionDTO();

    tempDTO.isDiff = true;
    tempDTO.fileID = diff.fileID;
    tempDTO.prevContent = this.buildDiffContext(diff, snapshot);

    const patches = this.DiffPatchService.patch_fromText(diff.content);
    tempDTO.content = this.DiffPatchService.patch_apply(
      patches,
      tempDTO.prevContent
    )[0];

    return tempDTO;
  }

  buildDiffContext(diff: DiffDTO, snapshot: SnapshotDTO): string {
    let retString = snapshot.content;

    const tempArr = this.diffArr.filter((ele) => {
      return ele.diffNumber < diff.diffNumber;
    });

    tempArr.sort(
      (a, b) =>
        a.diffNumber > b.diffNumber ? 1 : a.diffNumber < b.diffNumber ? -1 : 0 // Ascending sort on diffNumber
    );

    for (let element of tempArr) {
      let patches = this.DiffPatchService.patch_fromText(element.content);
      retString = this.DiffPatchService.patch_apply(patches, retString)[0];
    }

    return retString;
  }
}
