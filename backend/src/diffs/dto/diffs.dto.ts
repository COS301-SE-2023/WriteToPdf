export class DiffDTO {
  DiffID: string;
  MarkdownID: string;
  UserID: string;
  DisplayID: number;
  S3DiffID: number;
  LastModified: Date;
  Content: string;

  constructor() {
    this.DiffID = undefined;
    this.MarkdownID = undefined;
    this.UserID = undefined;
    this.DisplayID = undefined;
    this.S3DiffID = undefined;
    this.LastModified = undefined;
    this.Content = undefined;
  }
}