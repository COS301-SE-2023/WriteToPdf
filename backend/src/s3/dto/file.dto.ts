export class FileDTO {
  UserID: string;
  FileName: string;
  ParentDirectory: string;

  constructor() {
    this.UserID = undefined;
    this.FileName = undefined;
    this.ParentDirectory = undefined;
  }
}
