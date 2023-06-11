import { IsNotEmpty } from 'class-validator';
export class CreateUserDto {
  @IsNotEmpty()
  FirstName: string;

  @IsNotEmpty()
  LastName: string;

  @IsNotEmpty()
  Email: string;

  @IsNotEmpty()
  Password: string;
}
