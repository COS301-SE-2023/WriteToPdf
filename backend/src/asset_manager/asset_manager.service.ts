import { Injectable } from '@nestjs/common';
import { AssetDTO } from '../assets/dto/asset.dto';
import { ImageManagerService } from '../image_manager/image_manager.service';
import { RetrieveAllDTO } from './dto/retrieve_all.dto';
import { AssetsService } from '../assets/assets.service';

@Injectable()
export class AssetManagerService {
  constructor(
    private readonly imageManagerService: ImageManagerService,
    private readonly assetsService: AssetsService,
  ) {}

  upload_image(uploadImageDTO: AssetDTO) {
    return this.imageManagerService.upload(
      uploadImageDTO,
    );
  }

  async retrieve_all(
    retrieveAllDTO: RetrieveAllDTO,
  ) {
    // Get images from database
    const images =
      await this.imageManagerService.retrieveAll(
        retrieveAllDTO,
      );

    for (let i = 0; i < images.length; i++) {
      const assetDTO = new AssetDTO();
      assetDTO.AssetID = images[i].AssetID;
      assetDTO.UserID = images[i].UserID;

      // Retrieve the image from s3
      const asset =
        await this.imageManagerService.retrieveOne(
          assetDTO,
        );

      // compress/resize the image
      images[i].Image =
        await this.imageManagerService.compressImage(
          asset.Content,
        );
    }
    return images;
  }

  renameAsset(renameAssetDTO: AssetDTO) {
    return this.assetsService.renameAsset(
      renameAssetDTO,
    );
  }
}
