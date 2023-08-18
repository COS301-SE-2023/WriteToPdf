export class RefreshTokenDTO {
  UserID: number;
  Token: string;

  constructor() {
    this.UserID = undefined;
    this.Token = undefined;
  }
}
