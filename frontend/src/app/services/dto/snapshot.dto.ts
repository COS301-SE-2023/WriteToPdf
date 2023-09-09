export class SnapshotDTO {
  fileID: string;
  snapshotNumber: number;
  content: string;

  constructor() {
    this.fileID = '';
    this.snapshotNumber = 0;
    this.content = '';
  }
}
