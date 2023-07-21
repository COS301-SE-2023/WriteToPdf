export class ExportDTO {
  UserID: number;
  Type: string;
  MarkdownID: number;
  Content: any;

  constructor() {
    this.UserID = undefined;
    this.Type = undefined;
    this.MarkdownID = undefined;
    this.Content = undefined;
  }
}
