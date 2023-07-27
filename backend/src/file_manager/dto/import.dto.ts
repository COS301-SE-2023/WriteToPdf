export class ImportDTO {
  UserID: number;
  Type: string;
  FileName: number;
  Content: string;
  ParentFolderID: string;
  Path: string;

  constructor() {
    this.UserID = undefined;
    this.Type = undefined;
    this.FileName = undefined;
    this.Content = undefined;
    this.ParentFolderID = undefined;
    this.Path = undefined;
  }
}
