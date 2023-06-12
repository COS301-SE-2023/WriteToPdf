import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetDTO } from './create-asset.dto';

export class UpdateAssetDTO extends PartialType(
  CreateAssetDTO,
) {}
