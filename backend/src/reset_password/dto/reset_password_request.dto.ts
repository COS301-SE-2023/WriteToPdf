export class ResetPasswordRequestDTO {
  Token: string;
  Password: string;

  constructor() {
    this.Token = undefined;
    this.Password = undefined;
  }
}
