export class MarkdownFileDTO {
  UserID: number | undefined;
  MarkdownID: string | undefined;
  Path: string | undefined;
  Name: string | undefined;
  Content: string | undefined;
  LastModified: Date | undefined;
  Size: number | undefined;
  DateCreated: Date | undefined;
  ParentFolderID: string | undefined;
  SafeLock: boolean | undefined;

  constructor() {
    this.UserID = undefined;
    this.MarkdownID = undefined;
    this.Path = undefined;
    this.Name = undefined;
    this.Content = undefined;
    this.LastModified = undefined;
    this.Size = undefined;
    this.DateCreated = undefined;
    this.ParentFolderID = undefined;
    this.SafeLock = undefined;
  }
}
