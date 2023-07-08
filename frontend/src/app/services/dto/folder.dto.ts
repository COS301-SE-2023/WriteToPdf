export class FolderDTO {
  FolderID: string | undefined;
  DateCreated: Date | undefined;
  LastModified: Date | undefined;
  FolderName: string | undefined;
  Path: string | undefined;
  ParentFolderID: string | undefined;
  UserID: number | undefined;

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
