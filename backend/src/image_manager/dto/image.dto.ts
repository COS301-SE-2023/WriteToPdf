export class ImageDTO {
  UserID: number;
  FileName: string;
  Content: string;
  Path: string;
  ImageID: number;
  Size: number;
  DateCreated: Date;

  constructor() {
    this.Content = undefined;
    this.FileName = undefined;
    this.UserID = undefined;
    this.Path = undefined;
    this.ImageID = undefined;
    this.Size = undefined;
    this.DateCreated = undefined;
  }
}
