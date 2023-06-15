import { IsNotEmpty } from 'class-validator';
export class DeleteFileDTO {
  @IsNotEmpty()
  id: string;
}
