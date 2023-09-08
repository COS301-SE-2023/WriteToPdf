import { Injectable } from '@angular/core';
import { UserService } from './user.service';
// import DiffMatchPatch from 'diff-match-patch';
import { diff_match_patch as DiffMatchPatch } from 'diff-match-patch';
import { HttpClient } from '@angular/common/http';
import { DiffDTO } from './dto/diff.dto';
import { SnapshotDTO } from './dto/snapshot.dto';
import { FileDTO } from './dto/file.dto';

@Injectable({
  providedIn: 'root',
})
export class VersionControlService {
  constructor(private http: HttpClient) {}

  public snapshotArr: SnapshotDTO[] = [];
  public diffArr: DiffDTO[] = [];

  async test(): Promise<void> {
    let text1: string = '';
    let text2: string = '';
    const filePath1 = '../assets/VersionControl/test1.txt';
    this.http.get(filePath1, { responseType: 'text' }).subscribe((data) => {
      text1 = data;
      const filePath2 = '../assets/VersionControl/test2.txt';
      this.http.get(filePath2, { responseType: 'text' }).subscribe((data) => {
        text2 = data;
        const dmp = new DiffMatchPatch();
        const diff = dmp.diff_main(text1, text2);
        const patches = dmp.patch_make(diff);
        console.log(dmp.patch_toText(patches));
        console.log(dmp.patch_apply(patches, text1));
      });
    });
  }

  getDiff(fileDTO: FileDTO): DiffDTO {
    return new DiffDTO();
  }

  getAllDiffs(fileDTO: FileDTO): DiffDTO[] {
    return [new DiffDTO()];
  }

  getSnapshot(fileDTO: FileDTO): SnapshotDTO {
    return new SnapshotDTO();
  }

  getAllSnapshots(fileDTO: FileDTO): SnapshotDTO[] {
    return [new SnapshotDTO()];
  }

  patchDiff(fileDTO: FileDTO, diffDTO: DiffDTO): string {
    return '';
  }

  patchVersion(fileDTO: FileDTO, diffDTO: DiffDTO[]): string {
    return '';
  }

  patchSnapshot(fileDTO: FileDTO, snapshotDTO: SnapshotDTO): string {
    return '';
  }

  squashDiffs(diffDTO: DiffDTO[]): SnapshotDTO {
    return new SnapshotDTO();
  }

  visualiseDiff(diffDTO: DiffDTO): void {
    return;
  }
  visualiseVersion(diffDTO: DiffDTO[]): void {
    return;
  }
  visualiseSnapshot(snapshotDTO: SnapshotDTO): void {
    return;
  }
}
