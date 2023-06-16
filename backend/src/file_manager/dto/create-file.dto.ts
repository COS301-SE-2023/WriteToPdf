import { IsNotEmpty } from 'class-validator';
export class CreateFileDTO {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  path: string;
}
