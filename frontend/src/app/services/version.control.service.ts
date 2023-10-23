import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { diff_match_patch as DiffMatchPatch } from 'diff-match-patch';

import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';

import { DiffDTO } from './dto/diff.dto';
import { SnapshotDTO } from './dto/snapshot.dto';

import { FileService } from './file.service';
import { VersionDTO } from './dto/version.dto';

@Injectable({
  providedIn: 'root',
})
export class VersionControlService {
  constructor(
    private http: HttpClient,
    private fileService: FileService,
    private messageService: MessageService,
    private userService: UserService
  ) {}

  public snapshotArr: SnapshotDTO[] = [];
  public diffArr: DiffDTO[] = [];
  public versionArr: VersionDTO[] = [];

  private latestVersion: VersionDTO = new VersionDTO();
  private DiffPatchService = new DiffMatchPatch();

  async init(): Promise<void> {
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
        let tempDTO = new SnapshotDTO();
        tempDTO.MarkdownID = 'abc123';
        tempDTO.SnapshotNumber = +element.charAt(element.length - 1);
        tempDTO.Content = data;
        this.pushToSnapshotArr(tempDTO);
      });
    }

    for (let element of diffPathArr) {
      this.http.get(element, { responseType: 'text' }).subscribe((data) => {
        let tempDTO = new DiffDTO();
        tempDTO.MarkdownID = 'abc123';
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

  getLatestVersionContent(): string {
    return this.latestVersion.Content;
  }

  setLatestVersionContent(content: string) {
    this.latestVersion.Content = content;
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

  applyReadablePatch(text1: string, text2: string): string {
    const patches = this.DiffPatchService.patch_fromText(text2);
    return this.DiffPatchService.patch_apply(patches, text1)[0];
  }

  getPrettyHtml(text1: string, text2: string): string {
    const pattern_amp = /&amp;/g;
    const pattern_lt = /&lt;/g;
    const pattern_gt = /&gt;/g;
    const pattern_para = /&para;<br>/g;
    const pattern_nbsp = /&nbsp;/g;
    const open_ins = /<ins/g;
    const close_ins = /<\/ins/g;
    const open_del = /<del/g;
    const close_del = /<\/del/g;
    const del_color = /#ffe6e6/g;
    const ins_color = /#e6ffe6/g;
    const close_para = /<\/p>/g;

    const repl_text1 = text1
      .replace(pattern_amp, '&')
      .replace(pattern_lt, '<')
      .replace(pattern_gt, '>')
      .replace(pattern_para, '\n')
      .replace(pattern_nbsp, '');

    const repl_text2 = text2
      .replace(pattern_amp, '&')
      .replace(pattern_lt, '<')
      .replace(pattern_gt, '>')
      .replace(pattern_para, '\n')
      .replace(pattern_nbsp, '');

    const dpsDiff = this.LineDiff(
      repl_text1.replace(close_para, '</p>\n'),
      repl_text2.replace(close_para, '</p>\n')
    );
    this.DiffPatchService.diff_cleanupSemantic(dpsDiff);

    const prettyHtml = this.DiffPatchService.diff_prettyHtml(dpsDiff);

    return prettyHtml
      .replace(pattern_amp, '&')
      .replace(pattern_lt, '<')
      .replace(pattern_gt, '>')
      .replace(pattern_para, '\n')
      .replace(open_ins, '<span')
      .replace(close_ins, '</span')
      .replace(open_del, '<span')
      .replace(close_del, '</span')
      .replace(del_color, '#f995ab')
      .replace(ins_color, '#96ff9f');
  }

  LineDiff(text1: string, text2: string) {
    let charConvert = this.DiffPatchService.diff_linesToChars_(text1, text2);
    let lineText1 = charConvert.chars1;
    let lineText2 = charConvert.chars2;
    let lineArray = charConvert.lineArray;
    let diffs = this.DiffPatchService.diff_main(lineText1, lineText2, false);
    this.DiffPatchService.diff_charsToLines_(diffs, lineArray);
    return diffs;
  }

  snapshotRestore(snapshot: SnapshotDTO): void {
    this.snapshotArr = this.snapshotArr.filter((ele) => {
      return ele.SnapshotNumber <= snapshot.SnapshotNumber;
    });

    this.diffArr = this.diffArr.filter((ele) => {
      return ele.SnapshotNumber <= snapshot.SnapshotNumber;
    });
  }

  diffRestore(diff: DiffDTO): void {
    this.snapshotArr = this.snapshotArr.filter((ele) => {
      return ele.SnapshotNumber <= diff.SnapshotNumber;
    });

    this.diffArr = this.diffArr.filter((ele) => {
      return ele.SnapshotNumber <= diff.SnapshotNumber;
    });
  }
}
