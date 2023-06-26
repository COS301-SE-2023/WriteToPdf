export class ImportDTO {
  MarkdownID: string;
  Name: string;
  Content: string;
  Path: string;
  ParentFolderID: string;
  UserID: number;
  Type: string;

  constructor() {
    this.MarkdownID = undefined;
    this.Name = undefined;
    this.Content = undefined;
    this.Path = undefined;
    this.ParentFolderID = undefined;
    this.UserID = undefined;
    this.Type = undefined;
  }
}
