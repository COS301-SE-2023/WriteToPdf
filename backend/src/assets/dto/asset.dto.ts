export class AssetDTO {
  AssetID: string;
  TextID: string;
  Format: string;
  FileName: string;
  Image: string;
  DateCreated: Date;
  Size: number;
  ParentFolderID: string;
  UserID: number;
  Content: string;
  Type: string;
  ImageBuffer: Buffer;

  constructor() {
    this.AssetID = undefined;
    this.TextID = undefined;
    this.Format = undefined;
    this.FileName = undefined;
    this.Image = undefined;
    this.DateCreated = undefined;
    this.Size = undefined;
    this.ParentFolderID = undefined;
    this.UserID = undefined;
    this.Content = undefined;
    this.Type = undefined;
    this.ImageBuffer = undefined;
  }
}
