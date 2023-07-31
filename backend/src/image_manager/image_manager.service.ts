import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { S3Service } from '../s3/s3.service';
import { S3ServiceMock } from '../s3/__mocks__/s3.service';
import { AssetsService } from '../assets/assets.service';
import { AssetDTO } from '../assets/dto/asset.dto';
import * as CryptoJS from 'crypto-js';
import * as sharp from 'sharp';
import { RetrieveAllDTO } from '../asset_manager/dto/retrieve_all.dto';

@Injectable()
export class ImageManagerService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly s3ServiceMock: S3ServiceMock,
    private readonly assetsService: AssetsService,
  ) {}

  upload(
    uploadImageDTO: AssetDTO,
    isTest = false,
  ) {
    uploadImageDTO.AssetID = CryptoJS.SHA256(
      uploadImageDTO.UserID.toString() +
        new Date().getTime().toString(),
    ).toString();

    // if (!uploadImageDTO.ConvertedElement) {
    //   uploadImageDTO.ConvertedElement = '';
    // }

    if (!uploadImageDTO.Content) {
      uploadImageDTO.Content = '';
    }

    if (!uploadImageDTO.TextID) {
      uploadImageDTO.TextID = '';
    }

    // Store in database
    uploadImageDTO.Content = uploadImageDTO.Image;
    uploadImageDTO.Image = '';
    this.assetsService.saveAsset(uploadImageDTO);

    if (isTest) {
      // Save asset in the S3/local storage
      return this.s3ServiceMock.saveAsset(
        uploadImageDTO,
      );
    } else {
      return this.s3Service.saveAsset(
        uploadImageDTO,
      );
    }
  }

  retrieveAll(
    retrieveAllImagesDTO: RetrieveAllDTO,
  ) {
    return this.assetsService.retrieveAllAssets(
      retrieveAllImagesDTO,
    );
  }

  async retrieveOne(
    retrieveAssetDto: AssetDTO,
    isTest = false,
  ) {
    const response =
      await this.assetsService.retrieveOne(
        retrieveAssetDto,
      );

    // AssetID does not exist as specified asset type
    if (!response) {
      throw new HttpException(
        'Asset not found, check AssetID and Format',
        HttpStatus.NOT_FOUND,
      );
    }
    if (isTest) {
      // Retrieve asset from the S3/local storage
      return this.s3ServiceMock.retrieveAsset(
        retrieveAssetDto,
      );
    } else {
      return this.s3Service.retrieveAsset(
        retrieveAssetDto,
      );
    }
  }

  deleteAsset(
    removeImageDTO: AssetDTO,
    isTest = false,
  ) {
    // Delete from database
    this.assetsService.removeOne(
      removeImageDTO.AssetID,
    );

    if (isTest) {
      // Delete asset in the S3/local storage
      return this.s3ServiceMock.deleteAsset(
        removeImageDTO,
      );
    } else {
      return this.s3Service.deleteAsset(
        removeImageDTO,
      );
    }
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
