export class VersionDTO {
  fileID: string;
  diff: boolean;
  content: string;
  prevContent: string;

  constructor() {
    this.fileID = '';
    this.diff = true;
    this.content = '';
    this.prevContent = '';
  }
}
