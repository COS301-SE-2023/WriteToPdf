export class FolderDTO {
  FolderID: string;
  DateCreated: Date;
  LastModified: Date;
  FolderName: string;
  Path: string;
  ParentFolderID: string;
  UserID: string;

  constructor() {
    this.FolderID = undefined;
    this.DateCreated = undefined;
    this.LastModified = undefined;
    this.FolderName = undefined;
    this.Path = undefined;
    this.ParentFolderID = undefined;
    this.UserID = undefined;
  }
}
