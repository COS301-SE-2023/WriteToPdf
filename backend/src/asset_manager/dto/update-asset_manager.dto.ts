import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetManagerDto } from './create-asset_manager.dto';

export class UpdateAssetManagerDto extends PartialType(
  CreateAssetManagerDto,
) {}
