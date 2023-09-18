export class DiffDTO {
  UserID: string;
  FileID: string;
  DiffNumber: number;
  SnapshotNumber: number;
  Content: string;

  constructor() {
    this.UserID = '';
    this.FileID = '';
    this.DiffNumber = 0;
    this.SnapshotNumber = 0;
    this.Content = '';
  }
}
