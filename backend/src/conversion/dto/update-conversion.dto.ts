import { PartialType } from '@nestjs/mapped-types';
import { CreateConversionDto } from './create-conversion.dto';

export class UpdateConversionDto extends PartialType(
  CreateConversionDto,
) {}
