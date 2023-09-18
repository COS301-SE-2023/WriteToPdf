export class DiffDTO {
  UserID: number;
  FileID: string;
  DiffNumber: number;
  SnapshotNumber: number;
  Content: string;

  constructor() {
    this.UserID = 0;
    this.FileID = '';
    this.DiffNumber = 0;
    this.SnapshotNumber = 0;
    this.Content = '';
  }
}
