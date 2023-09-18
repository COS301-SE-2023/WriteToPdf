export class SnapshotDTO {
  UserID: number;
  FileID: string;
  SnapshotNumber: number;
  Content: string;

  constructor() {
    this.UserID = 0;
    this.FileID = '';
    this.SnapshotNumber = 0;
    this.Content = '';
  }
}
