export class SnapshotDTO {
  UserID: number;
  MarkdownID: string;
  SnapshotNumber: number;
  Content: string;

  constructor() {
    this.UserID = 0;
    this.MarkdownID = '';
    this.SnapshotNumber = 0;
    this.Content = '';
  }
}
