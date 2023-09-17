export class SnapshotDTO {
  SnapshotID: string;
  MarkdownID: string;
  UserID: number;
  DisplayID: number;
  S3SnapshotID: number;
  LastModified: Date;
  Content: string;

  constructor() {
    this.SnapshotID = undefined;
    this.MarkdownID = undefined;
    this.UserID = undefined;
    this.DisplayID = undefined;
    this.S3SnapshotID = undefined;
    this.LastModified = undefined;
    this.Content = undefined;
  }
}