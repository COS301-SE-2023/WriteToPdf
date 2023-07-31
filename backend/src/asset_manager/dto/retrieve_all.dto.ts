export class RetrieveAllDTO {
  UserID: number;
  Thumbnails: string[]; // base64 strings
  TextSnippets: string[]; // text summaries
  FileNames: string[]; // from db
  DatesCreated: Date[]; // from db
  ImageIDs: number[]; // from db
  Sizes: number[];
  ParentFolderID: string;

  constructor() {
    this.UserID = undefined;
    this.Thumbnails = undefined;
    this.TextSnippets = undefined;
    this.FileNames = undefined;
    this.DatesCreated = undefined;
    this.ImageIDs = undefined;
    this.Sizes = undefined;
    this.ParentFolderID = undefined;
  }
}
