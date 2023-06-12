import { IsNotEmpty } from 'class-validator';
export class LoginUserDTO {
  @IsNotEmpty()
  Email: string;

  @IsNotEmpty()
  Password: string;
}
