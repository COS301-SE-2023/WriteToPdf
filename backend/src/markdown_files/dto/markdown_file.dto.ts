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
  NextDiffIndex: number;
  NextSnapshotIndex: number
  TotalNumDiffs: number;
  TotalNumSnapshots: number;

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
    this.NextDiffIndex = undefined;
    this.NextSnapshotIndex = undefined;
    this.TotalNumDiffs = undefined;
    this.TotalNumSnapshots = undefined;
  }
}
