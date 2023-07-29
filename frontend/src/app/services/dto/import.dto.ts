export class ImportDTO {
  Name: string | undefined;
  Content: string | undefined;
  Path: string | undefined;
  ParentFolderID: string | undefined;
  UserID: number | undefined;
  Type: string | undefined;

  constructor() {
    this.Name = undefined;
    this.Content = undefined;
    this.Path = undefined;
    this.ParentFolderID = undefined;
    this.UserID = undefined;
    this.Type = undefined;
  }
}
