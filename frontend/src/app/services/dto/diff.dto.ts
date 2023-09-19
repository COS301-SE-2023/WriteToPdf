export class DiffDTO {
  UserID: number;
  MarkdownID: string;
  DiffNumber: number;
  SnapshotNumber: number;
  Content: string;
  SnapshotPayload: string;

  constructor() {
    this.UserID = 0;
    this.MarkdownID = '';
    this.DiffNumber = 0;
    this.SnapshotNumber = 0;
    this.Content = '';
    this.SnapshotPayload = '';
  }
}
