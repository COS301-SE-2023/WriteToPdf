export class CreateUserDto {
  FirstName: string | undefined;
  LastName: string | undefined;
  Email: string | undefined;
  Password: string | undefined;

  isValid() {
    return (
      this.Email &&
      this.Password &&
      this.FirstName &&
      this.LastName
    );
  }
}
