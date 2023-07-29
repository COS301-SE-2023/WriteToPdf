import { Injectable } from '@nestjs/common';
import { AssetDTO } from '../assets/dto/asset.dto';
import { ImageManagerService } from '../image_manager/image_manager.service';
import { TextManagerService } from '../text_manager/text_manager.service';
import { RetrieveAllDTO } from './dto/retrieve_all.dto';
import { AssetsService } from '../assets/assets.service';
import { S3Service } from '../s3/s3.service';
import { S3ServiceMock } from '../s3/__mocks__/s3.service';

@Injectable()
export class AssetManagerService {
  constructor(
    private readonly imageManagerService: ImageManagerService,
    private readonly assetsService: AssetsService,
    private readonly s3Service: S3Service,
    private readonly s3ServiceMock: S3ServiceMock,
    private readonly textManagerService: TextManagerService,
  ) {}

  // upload_image(uploadImageDTO: AssetDTO) {
  //   return this.imageManagerService.upload(
  //     uploadImageDTO,
  //   );
  // }

  // upload_text(uploadTextDTO: AssetDTO) {
  //   return this.textManagerService.upload(
  //     uploadTextDTO,
  //   );
  // }

  upload_asset(
    uploadAssetDTO: AssetDTO,
    isTest = false,
  ) {
    if (uploadAssetDTO.Format === 'text') {
      return this.textManagerService.upload(
        uploadAssetDTO,
      );
    } else if (
      uploadAssetDTO.Format === 'image'
    ) {
      return this.imageManagerService.upload(
        uploadAssetDTO,
      );
    }
  }

  async retrieve_all(
    retrieveAllDTO: RetrieveAllDTO,
    isTest = false,
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
        assetDTO.ConvertedElement = '';

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

    for (let j = 0; j < assets.length; j++) {
      if (assets[j].Format === 'text') {
        const assetDTO = new AssetDTO();
        assetDTO.AssetID = assets[j].AssetID;
        assetDTO.UserID = assets[j].UserID;
        assetDTO.ConvertedElement = '';

        // Retrieve the delineated data from S3
        const tempAssetDTO =
          await this.textManagerService.retrieveOne(
            assetDTO,
          );

        assets[j].Image = tempAssetDTO.Image;
      }
    }

    return assets;
  }

  // When user copies an asset to clipboard
  retrieve_one(
    retrieveAssetDTO: AssetDTO,
    isTest = false,
  ) {
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

  delete_asset(
    deleteAssetDTO: AssetDTO,
    isTest = false,
  ) {
    // Delete asset from database
    this.assetsService.removeOne(
      deleteAssetDTO.AssetID,
    );

    if (isTest) {
      return this.s3ServiceMock.deleteAsset(
        deleteAssetDTO,
      );
    } else {
      // Delete asset from S3/local storage
      return this.s3Service.deleteAsset(
        deleteAssetDTO,
      );
    }
  }
}
