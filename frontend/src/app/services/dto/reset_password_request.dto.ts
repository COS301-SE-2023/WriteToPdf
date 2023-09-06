export class ResetPasswordRequestDTO {
    Token: string | undefined;
    Password: string | undefined;
  
    constructor() {
      this.Token = undefined;
      this.Password = undefined;
    }
  }
  