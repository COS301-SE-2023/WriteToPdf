export class LoginUserDTO {
  Email: string | undefined;
  Password: string | undefined;

  public isValid() {
    return this.Email && this.Password;
  }
}
