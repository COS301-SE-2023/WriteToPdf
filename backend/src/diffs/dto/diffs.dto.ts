export class DiffDTO {
  DiffID: string;
  MarkdownID: string;
  UserID: number;
  DisplayID: number;
  S3DiffIndex: number;
  LastModified: Date;
  Content: string;
  SnapshotID: string;

  constructor() {
    this.DiffID = undefined;
    this.MarkdownID = undefined;
    this.UserID = undefined;
    this.DisplayID = undefined;
    this.S3DiffIndex = undefined;
    this.LastModified = undefined;
    this.Content = undefined;
    this.SnapshotID = undefined;
  }
}
