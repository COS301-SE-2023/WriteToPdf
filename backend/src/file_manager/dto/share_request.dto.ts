export class ShareRequestDTO {
  UserID: number;
  RecipientEmail: string;
  MarkdownID: string;

  constructor() {
    this.UserID = undefined;
    this.RecipientEmail = undefined;
    this.MarkdownID = undefined;
  }
}
