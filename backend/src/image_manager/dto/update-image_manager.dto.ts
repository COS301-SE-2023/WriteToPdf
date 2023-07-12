import { PartialType } from '@nestjs/mapped-types';
import { CreateImageManagerDto } from './create-image_manager.dto';

export class UpdateImageManagerDto extends PartialType(
  CreateImageManagerDto,
) {}
