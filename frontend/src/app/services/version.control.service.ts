import { Injectable } from '@angular/core';
import { UserService } from './user.service';
// import DiffMatchPatch from 'diff-match-patch';
import { Diff, diff_match_patch as DiffMatchPatch } from 'diff-match-patch';
import { HttpClient } from '@angular/common/http';
import { DiffDTO } from './dto/diff.dto';
import { SnapshotDTO } from './dto/snapshot.dto';
import { FileDTO } from './dto/file.dto';

import { FileService } from './file.service';

@Injectable({
  providedIn: 'root',
})
export class VersionControlService {
  constructor(private http: HttpClient, private fileService: FileService) {}

  public snapshotArr: SnapshotDTO[] = [];
  public diffArr: DiffDTO[] = [];
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
        tempDTO.snapshotNumber = +element.charAt(element.length - 1);
        tempDTO.content = data;
        this.pushToDiffArr(tempDTO);
      });
    }

    await new Promise((f) => setTimeout(f, 10));

    for (let element of this.diffArr) {
      console.log(element);
    }
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

  createDiff(fileDTO: FileDTO): DiffDTO {
    const latestSnapshot = this.getLatestSnapshot();
    let snapshotContent = latestSnapshot.content;

    const latestDiff = this.getLatestDiff(); // TODO: Check what we need when there are no diffs
    const latestDiffNumber = latestDiff.diffNumber;

    // Get all relevant diffs
    const relevantDiffs = this.diffArr.filter(
      (a) => a.snapshotNumber === latestSnapshot.snapshotNumber
    );

    // Patch all relevant diffs
    for (let diff of relevantDiffs) {
      snapshotContent = this.patchDiff(snapshotContent, diff);
    }

    // Create newest diff and readable patch
    const diff = this.DiffPatchService.diff_main(
      snapshotContent,
      fileDTO.content
    );
    const patches = this.DiffPatchService.patch_make(diff);

    // Create and set new DTO
    const readableDiff = new DiffDTO();
    readableDiff.diffNumber = latestDiffNumber + 1;
    readableDiff.fileID = fileDTO.fileID;
    readableDiff.snapshotNumber = latestSnapshot.snapshotNumber; // TODO: Doesn't take into account squashing of diffs
    readableDiff.content = this.DiffPatchService.patch_toText(patches);
    return readableDiff;
  }

  getLatestSnapshot(): SnapshotDTO {
    // TODO: No need to sort
    // Get latest snapshot
    this.snapshotArr.sort((a, b) =>
      a.snapshotNumber > b.snapshotNumber
        ? 1
        : a.snapshotNumber < b.snapshotNumber
        ? -1
        : 0
    );

    return this.snapshotArr[0];
  }

  getLatestDiff(): DiffDTO {
    // Get latest diff number
    this.diffArr.sort((a, b) =>
      a.diffNumber > b.diffNumber ? 1 : a.diffNumber < b.diffNumber ? -1 : 0
    );

    return this.diffArr[0];
  }

  patchDiff(content: string, diffDTO: DiffDTO): string {
    const patches = this.DiffPatchService.patch_fromText(diffDTO.content);
    const patchResult = this.DiffPatchService.patch_apply(patches, content);
    return patchResult[0];
  }

  patchVersion(fileDTO: FileDTO, diffDTO: DiffDTO[]): string {
    return '';
  }

  patchSnapshot(fileDTO: FileDTO, snapshotDTO: SnapshotDTO): string {
    return '';
  }

  squashDiffs(diffDTOs: DiffDTO[]): SnapshotDTO {
    const latestSnapshot = this.getLatestSnapshot();
    let snapshotContent = latestSnapshot.content;

    // Patch all diffs
    for (let diff of diffDTOs) {
      snapshotContent = this.patchDiff(snapshotContent, diff);
    }

    const newSnapshot = new SnapshotDTO();
    newSnapshot.content = snapshotContent;
    newSnapshot.fileID = latestSnapshot.fileID;
    newSnapshot.snapshotNumber = latestSnapshot.snapshotNumber + 1;

    return newSnapshot;
  }
}
