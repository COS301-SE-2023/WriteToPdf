import { PartialType } from '@nestjs/mapped-types';
import { CreateTextManagerDto } from './create-text_manager.dto';

export class UpdateTextManagerDto extends PartialType(
  CreateTextManagerDto,
) {}
