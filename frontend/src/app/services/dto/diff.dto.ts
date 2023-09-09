export class DiffDTO {
  fileID: string;
  diffNumber: number;
  snapshotNumber: number;
  content: string;

  constructor() {
    this.fileID = '';
    this.diffNumber = 0;
    this.snapshotNumber = 0;
    this.content = '';
  }
}
