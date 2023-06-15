import { IsNotEmpty } from 'class-validator';
export class RenameFileDTO {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  newName: string;
}
