import { PartialType } from '@nestjs/mapped-types';
import { CreateFolderDTO } from './create-folder.dto';

export class UpdateFolderDTO extends PartialType(
  CreateFolderDTO,
) {}
