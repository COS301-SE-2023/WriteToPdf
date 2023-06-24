import { IsNotEmpty } from 'class-validator';

export class FileDTO {
  @IsNotEmpty()
  UserID: string;

  @IsNotEmpty()
  FileName: string;

  @IsNotEmpty()
  ParentDirectory: string;
}
