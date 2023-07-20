import { Injectable } from '@nestjs/common';
import { S3Service } from '../s3/s3.service';
import { AssetsService } from '../assets/assets.service';
import { AssetDTO } from '../assets/dto/asset.dto';
import { SHA256 } from 'crypto-js';
import * as sharp from 'sharp';
import { RetrieveAllDTO } from '../asset_manager/dto/retrieve_all.dto';

@Injectable()
export class ImageManagerService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly assetsService: AssetsService,
  ) {}

  upload(uploadImageDTO: AssetDTO) {
    uploadImageDTO.AssetID = SHA256(
      uploadImageDTO.UserID.toString() +
        new Date().getTime().toString(),
    ).toString();

    if (!uploadImageDTO.ConvertedElement) {
      uploadImageDTO.ConvertedElement = '';
    }

    if (!uploadImageDTO.Content) {
      uploadImageDTO.Content = '';
    }

    // Store in database
    const imageData = uploadImageDTO.Image;
    uploadImageDTO.Image = '';
    this.assetsService.saveAsset(uploadImageDTO);
    uploadImageDTO.Image = imageData;

    // Store in S3/local storage
    return this.s3Service.saveAsset(
      uploadImageDTO,
    );
  }

  retrieveAll(
    retrieveAllImagesDTO: RetrieveAllDTO,
  ) {
    return this.assetsService.retrieveAllAssets(
      retrieveAllImagesDTO,
    );
  }

  // Get the base64 string of the image
  retrieveOne(retrieveAssetDto: AssetDTO) {
    return this.s3Service.retrieveAsset(
      retrieveAssetDto,
    );
  }

  deleteAsset(removeImageDTO: AssetDTO) {
    // Delete from database
    this.assetsService.removeOne(
      removeImageDTO.AssetID,
    );

    // Delete from S3/local storage
    return this.s3Service.deleteAsset(
      removeImageDTO,
    );
  }

  renameAsset(renameImageDTO: AssetDTO) {
    // Update database
    return this.assetsService.renameAsset(
      renameImageDTO,
    );
  }

  async compressImage(base64String: string) {
    // Remove the leading "data:image/jpeg;base64,"
    // leaving only the raw data
    const strippedBase64 = base64String
      .split(';base64,')
      .pop();

    const imageBuffer = Buffer.from(
      strippedBase64,
      'base64',
    );

    const compressedImage = await sharp(
      imageBuffer,
    )
      .resize(100, 100)
      .toFormat('jpeg')
      .toBuffer();

    let thumbnail = 'data:image/jpeg;base64,';
    thumbnail +=
      compressedImage.toString('base64');
    return thumbnail;
  }
}
