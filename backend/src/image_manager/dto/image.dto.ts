export class ImageDTO {
  UserID: number;
  Content: string;
  AuthToken: string;

  constructor() {
    this.Content = undefined;
    this.UserID = undefined;
    this.AuthToken = undefined;
  }
}
