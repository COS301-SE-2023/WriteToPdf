export class ShareRequestDTO {
  UserID: number;
  RecipientEmail: string;
  markdownID: string;

  constructor() {
    this.UserID = undefined;
    this.RecipientEmail = undefined;
    this.markdownID = undefined;
  }
}
