import { Injectable } from '@nestjs/common';
import { ImageDTO } from './dto/image.dto';
import { S3Service } from '../s3/s3.service';
import { AssetsService } from '../assets/assets.service';
import { RetrieveAllImagesDTO } from './dto/retrieve_all_images.dto';
import { AssetDTO } from '../assets/dto/asset.dto';
import { SHA256 } from 'crypto-js';
import { Asset } from '../assets/entities/asset.entity';
import * as sharp from 'sharp';

@Injectable()
export class ImageManagerService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly assetsService: AssetsService,
  ) {}

  upload(uploadImageDto: AssetDTO) {
    uploadImageDto.AssetID = SHA256(
      uploadImageDto.UserID.toString() +
        new Date().getTime().toString(),
    ).toString();

    // Store in database
    this.assetsService.createImage(
      uploadImageDto,
    );

    // Store in S3/local storage
    return this.s3Service.saveImage(
      uploadImageDto,
    );
  }

  retrieveAll(
    retrieveAllImagesDTO: RetrieveAllImagesDTO,
  ) {
    return this.assetsService.retrieveAll(
      retrieveAllImagesDTO,
    );
  }

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
