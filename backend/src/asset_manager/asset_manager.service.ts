import { Injectable } from '@nestjs/common';
import { AssetDTO } from '../assets/dto/asset.dto';
import { ImageManagerService } from '../image_manager/image_manager.service';
import { TextManagerService } from '../text_manager/text_manager.service';
import { RetrieveAllDTO } from './dto/retrieve_all.dto';
import { AssetsService } from '../assets/assets.service';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class AssetManagerService {
  constructor(
    private readonly imageManagerService: ImageManagerService,
    private readonly assetsService: AssetsService,
    private readonly s3Service: S3Service,
    private readonly textManagerService: TextManagerService,
  ) {}

  upload_image(uploadImageDTO: AssetDTO) {
    return this.imageManagerService.upload(
      uploadImageDTO,
    );
  }

  upload_text(uploadTextDTO: AssetDTO) {
    return this.textManagerService.upload(
      uploadTextDTO,
    );
  }

  async retrieve_all(
    retrieveAllDTO: RetrieveAllDTO,
  ) {
    // Get asset references from database
    const assets =
      await this.assetsService.retrieveAllAssets(
        retrieveAllDTO,
      );

    // Resize all image assets
    for (let i = 0; i < assets.length; i++) {
      if (assets[i].Format === 'image') {
        const assetDTO = new AssetDTO();
        assetDTO.AssetID = assets[i].AssetID;
        assetDTO.UserID = assets[i].UserID;

        // Retrieve the image from s3
        const asset =
          await this.imageManagerService.retrieveOne(
            assetDTO,
          );

        // Compress/Resize the image
        assets[i].Image =
          await this.imageManagerService.compressImage(
            asset.Content,
          );
      }
    }
    return assets;
  }

  // When user copies an asset to clipboard
  retrieve_one(retrieveAssetDTO: AssetDTO) {
    if (retrieveAssetDTO.Format === 'text') {
      return this.textManagerService.retrieveOne(
        retrieveAssetDTO,
      );
    }

    if (retrieveAssetDTO.Format === 'image') {
      return this.imageManagerService.retrieveOne(
        retrieveAssetDTO,
      );
    }
  }

  rename_asset(renameAssetDTO: AssetDTO) {
    return this.assetsService.renameAsset(
      renameAssetDTO,
    );
  }

  delete_asset(deleteAssetDTO: AssetDTO) {
    // Delete asset from database
    this.assetsService.removeOne(
      deleteAssetDTO.AssetID,
    );

    // Delete asset from S3/local storage
    return this.s3Service.deleteAsset(
      deleteAssetDTO,
    );
  }
}
