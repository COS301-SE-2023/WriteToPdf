export class UserDTO {
  UserID: number;
  FirstName: string;
  LastName: string;
  Email: string;
  Password: string;

  constructor() {
    this.UserID = undefined;
    this.FirstName = undefined;
    this.LastName = undefined;
    this.Email = undefined;
    this.Password = undefined;
  }
}
