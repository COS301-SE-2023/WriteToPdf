import { Injectable } from '@angular/core';
import { UserService } from './user.service';
// import DiffMatchPatch from 'diff-match-patch';
import { diff_match_patch as DiffMatchPatch } from 'diff-match-patch';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class VersionControlService {
  constructor(private http: HttpClient) {}

  async test(): Promise<void> {
    try {
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
    } catch (err) {
      console.error(err);
    }
  }
}
