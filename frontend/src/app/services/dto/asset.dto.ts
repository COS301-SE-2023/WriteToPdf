export class AssetDTO {
  AssetID: string | undefined;
  Format: string | undefined;
  FileName: string | undefined;
  Content: string | undefined;
  Image: string | undefined;
  DateCreated: Date | undefined;
  Size: number | undefined;
  ParentFolderID: string | undefined;
  Path: string | undefined;
  UserID: number | undefined;
  Type: string | undefined;

  constructor() {
    this.AssetID = undefined;
    this.Format = undefined;
    this.FileName = undefined;
    this.Content = undefined;
    this.DateCreated = undefined;
    this.Size = undefined;
    this.ParentFolderID = undefined;
    this.UserID = undefined;
    this.Type = undefined;
  }
}
