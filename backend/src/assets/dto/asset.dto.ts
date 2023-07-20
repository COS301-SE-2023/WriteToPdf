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
  Type: string;

  constructor() {
    this.AssetID = undefined;
    this.Format = undefined;
    this.FileName = undefined;
    this.ConvertedElement = '';
    this.Image = '';
    this.DateCreated = undefined;
    this.Size = undefined;
    this.ParentFolderID = undefined;
    this.UserID = undefined;
    this.Content = undefined;
    this.Type = undefined;
  }
}
