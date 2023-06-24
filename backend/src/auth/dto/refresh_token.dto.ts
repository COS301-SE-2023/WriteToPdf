export class RefreshTokenDTO {
  UserID: number;
  Email: string;
  Token: string;
  ExpiresAt: Date;

  constructor() {
    this.UserID = undefined;
    this.Email = undefined;
    this.Token = undefined;
    this.ExpiresAt = undefined;
  }
}
