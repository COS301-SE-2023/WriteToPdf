export class CreateUserDto {
  FirstName: string;
  LastName: string;
  Email: string;
  Password: string;

  isValid() {
    return (
      this.Email &&
      this.Password &&
      this.FirstName &&
      this.LastName
    );
  }
}
