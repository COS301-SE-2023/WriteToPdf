import { Injectable } from '@nestjs/common';
import { CreateAssetManagerDto } from './dto/create-asset_manager.dto';
import { UpdateAssetManagerDto } from './dto/update-asset_manager.dto';
import { AssetDTO } from '../assets/dto/asset.dto';
import { ImageManagerService } from '../image_manager/image_manager.service';

@Injectable()
export class AssetManagerService {
  constructor(
    private readonly imageManagerService: ImageManagerService,
  ) {}

  upload_image(uploadImageDTO: AssetDTO) {
    return this.imageManagerService.upload(
      uploadImageDTO,
    );
  }
}
