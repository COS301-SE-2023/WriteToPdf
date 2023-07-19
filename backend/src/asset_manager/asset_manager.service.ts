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

    // preprocess text
    return images;
  }

  retrieve_all_root_assets(
    retrieveAllDTO: RetrieveAllDTO,
  ) {
    return this.assetsService.retrieveAllRootAssets(
      retrieveAllDTO,
    );
  }

  retrieve_one(retrieveAssetDTO: AssetDTO) {
    return this.s3Service.retrieveAsset(
      retrieveAssetDTO,
    );
  }

  // retrieve_image(retrieveImageDTO: AssetDTO) {
  //   return this.imageManagerService.retrieveOne(
  //     retrieveImageDTO,
  //   );
  // }

  rename_asset(renameAssetDTO: AssetDTO) {
    return this.assetsService.renameAsset(
      renameAssetDTO,
    );
  }

  delete_asset(deleteAssetDTO: AssetDTO) {
    // Delete from database
    this.assetsService.removeOne(
      deleteAssetDTO.AssetID,
    );

    // Delete from S3/local storage
    return this.s3Service.deleteAsset(
      deleteAssetDTO,
    );
  }
}
