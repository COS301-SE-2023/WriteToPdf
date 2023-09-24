export class ShareRequestDTO {
  UserID: number;
  RecipientEmail: string;
  MarkdownFileID: string;

  constructor() {
    this.UserID = undefined;
    this.RecipientEmail = undefined;
    this.MarkdownFileID = undefined;
  }
}
