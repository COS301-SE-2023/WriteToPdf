export class UserDTO {
  UserID: number | undefined;
  FirstName: string | undefined;
  LastName: string | undefined;
  Email: string | undefined;
  Salt: string | undefined;
  Password: string | undefined;

  isValid() {
    return this.UserID && this.Email && this.Password && this.FirstName && this.LastName && this.Salt;
  }
}
