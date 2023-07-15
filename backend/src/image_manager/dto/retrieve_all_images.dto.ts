export class RetrieveRecentImagesDTO {
  UserID: number;
  Thumbnails: string[];
  FileNames: string[];
  DatesCreated: Date[];
  ImageIDs: number[];
  Sizes: number[];

  constructor() {
    this.UserID = undefined;
    this.Thumbnails = undefined;
    this.FileNames = undefined;
    this.DatesCreated = undefined;
    this.ImageIDs = undefined;
    this.Sizes = undefined;
  }
}
