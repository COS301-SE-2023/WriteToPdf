export class DiffDTO {
  UserID: number;
  MarkdownID: string;
  DiffNumber: number;
  SnapshotNumber: number;
  Content: string;
  SnapshotPayload: string;
  LastModified: Date;
  LastModifiedString: string;
  Name: string;
  SnapshotID: string;
  VersionNumber: number;
  HasSnapshot: boolean;

  constructor() {
    this.UserID = 0;
    this.MarkdownID = '';
    this.DiffNumber = 0;
    this.SnapshotNumber = 0;
    this.Content = '';
    this.SnapshotPayload = '';
    this.LastModified = new Date();
    this.LastModifiedString = '';
    this.Name = '';
    this.SnapshotID = '';
    this.VersionNumber = 0;
    this.HasSnapshot = false;
  }
}
