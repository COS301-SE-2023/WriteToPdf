export class VersionRollbackDTO {
  MarkdownID: string;
  UserID: number;
  DiffIndex: number;
  Content: string;

  constructor() {
    this.MarkdownID = undefined;
    this.UserID = undefined;
    this.DiffIndex = undefined;
    this.Content = undefined;
  }
}
