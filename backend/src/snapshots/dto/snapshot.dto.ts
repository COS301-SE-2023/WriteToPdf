export class SnapshotDTO {
  SnapshotID: string;
  MarkdownID: string;
  UserID: number;
  DisplayID: number;
  S3SnapshotIndex: number;
  LastModified: Date;
  Content: string;
  OldestSnapshot: boolean;

  constructor() {
    this.SnapshotID = undefined;
    this.MarkdownID = undefined;
    this.UserID = undefined;
    this.DisplayID = undefined;
    this.S3SnapshotIndex = undefined;
    this.LastModified = undefined;
    this.Content = undefined;
    this.OldestSnapshot = false;
  }
}
