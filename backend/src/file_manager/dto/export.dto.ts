export class ExportDTO {
  UserID: number;
  Type: string;
  MarkdownID: string;
  Content: any;

  constructor() {
    this.UserID = undefined;
    this.Type = undefined;
    this.MarkdownID = undefined;
    this.Content = undefined;
  }
}
