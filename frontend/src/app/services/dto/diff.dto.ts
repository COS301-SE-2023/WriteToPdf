export class DiffDTO {
  fileID: string;
  diffNumber: number;
  content: string;

  constructor() {
    this.fileID = '';
    this.diffNumber = 0;
    this.content = '';
  }
}
