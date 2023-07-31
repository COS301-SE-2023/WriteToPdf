export class ImportDTO {
  UserID: number;
  Type: string;
  Name: string;
  Content: any;
  ParentFolderID: string;
  Path: string;

  constructor() {
    this.UserID = undefined;
    this.Type = undefined;
    this.Name = undefined;
    this.Content = undefined;
    this.ParentFolderID = undefined;
    this.Path = undefined;
  }
}
