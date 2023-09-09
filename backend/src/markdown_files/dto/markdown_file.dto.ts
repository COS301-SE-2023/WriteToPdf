export class MarkdownFileDTO {
  MarkdownID: string;
  Name: string;
  Content: string;
  Path: string;
  DateCreated: Date;
  LastModified: Date;
  Size: number;
  ParentFolderID: string;
  UserID: number;
  SafeLock: boolean;
  NewDiff: string;
  PreviousDiffs: string[];
  NextDiffID: number;
  NextSnapshotID: number;

  constructor() {
    this.MarkdownID = undefined;
    this.Name = undefined;
    this.Content = undefined;
    this.Path = undefined;
    this.DateCreated = undefined;
    this.LastModified = undefined;
    this.Size = undefined;
    this.ParentFolderID = undefined;
    this.UserID = undefined;
    this.SafeLock = false;
    this.NewDiff = undefined;
    this.PreviousDiffs = undefined;
    this.NextDiffID = undefined;
    this.NextSnapshotID = undefined;
  }
}
