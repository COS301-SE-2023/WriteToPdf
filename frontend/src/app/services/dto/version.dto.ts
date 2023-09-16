export class VersionDTO {
  fileID: string;
  isDiff: boolean;
  content: string;
  prevContent: string;

  constructor() {
    this.fileID = '';
    this.isDiff = true;
    this.content = '';
    this.prevContent = '';
  }
}
