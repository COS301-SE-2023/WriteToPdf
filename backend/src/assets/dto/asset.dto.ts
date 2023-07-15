export class AssetDTO {
  AssetID: string;
  Format: string;
  FileName: string;
  ConvertedElement: string;
  Image: string;
  DateCreated: Date;
  Size: number;
  ParentFolderID: string;
  UserID: number;
  Content: string;

  constructor() {
    this.AssetID = undefined;
    this.Format = undefined;
    this.FileName = undefined;
    this.ConvertedElement = undefined;
    this.Image = undefined;
    this.DateCreated = undefined;
    this.Size = undefined;
    this.ParentFolderID = undefined;
    this.UserID = undefined;
    this.Content = undefined;
  }
}
