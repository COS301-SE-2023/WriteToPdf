export class AssetDTO {
  AssetID: string; // for the image file/thumbnail
  TextID: string; // for the OCR text data file
  Format: string;
  FileName: string;
  Image: string; // used for storing image data
  DateCreated: Date;
  Size: number;
  ParentFolderID: string;
  UserID: number;
  Content: string; // used for storing OCR text data
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
