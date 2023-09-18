export class VersionDTO {
  MarkdownID: string;
  IsDiff: boolean;
  Content: string;
  PrevContent: string;

  constructor() {
    this.MarkdownID = '';
    this.IsDiff = true;
    this.Content = '';
    this.PrevContent = '';
  }
}
