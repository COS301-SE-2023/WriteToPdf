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
  PreviousDiffs: string[];
  NewDiff: string;
  NextDiffID: number;

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
    this.PreviousDiffs = [];
    this.NewDiff = undefined;
    this.NextDiffID = undefined;
  }
}
