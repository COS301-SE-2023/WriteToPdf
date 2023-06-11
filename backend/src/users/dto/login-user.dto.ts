export class LoginUserDTO {
  Email: string;
  Password: string;

  public isValid() {
    return this.Email && this.Password;
  }
}
