export class ImageDTO {
  UserID: number;
  Content: string;
  Path: string;
  ImageID: number;
  Size: number;
  DateCreated: Date;

  constructor() {
    this.Content = undefined;
    this.UserID = undefined;
    this.Path = undefined;
    this.ImageID = undefined;
    this.Size = undefined;
    this.DateCreated = undefined;
  }
}
