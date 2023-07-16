import { Injectable } from '@nestjs/common';
import { ImageDTO } from './dto/image.dto';
import { S3Service } from '../s3/s3.service';
import { AssetsService } from '../assets/assets.service';
import { RetrieveAllImagesDTO } from './dto/retrieve_all_images.dto';
import { AssetDTO } from '../assets/dto/asset.dto';
import { SHA256 } from 'crypto-js';
import { Asset } from '../assets/entities/asset.entity';
import sharp from 'sharp';

@Injectable()
export class ImageManagerService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly assetsService: AssetsService,
  ) {}

  create(createImageDto: ImageDTO) {
    return 'This action adds a new imageManager';
  }

  findAll() {
    return `This action returns all imageManager`;
  }

  findOne(id: number) {
    return `This action returns a #${id} imageManager`;
  }

  update(id: number, updateImageDto: ImageDTO) {
    return `This action updates a #${id} imageManager`;
  }

  remove(id: number) {
    return `This action removes a #${id} imageManager`;
  }

  upload(uploadImageDto: AssetDTO) {
    // TODO place the image in the database
    const assetID = SHA256(
      uploadImageDto.UserID.toString() +
        new Date().getTime().toString(),
    ).toString();

    uploadImageDto.AssetID = assetID;

    this.assetsService.createImage(
      uploadImageDto,
    );

    return this.s3Service.saveImage(
      uploadImageDto,
    );
  }

  retrieveAll(
    retrieveAllImagesDTO: RetrieveAllImagesDTO,
  ) {
    return this.assetsService.retrieveAll();
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

  async compressImage(
    assetID: string,
    userID: number,
  ) {
    // Get image from S3/local storage
    const imageDTO =
      await this.s3Service.retrieveAssetByID(
        assetID,
        userID,
      );

    // Create buffer from image
    const imageBuffer = Buffer.from(
      imageDTO.Content,
      'base64',
    );

    // Compress
    const compressedImage = await sharp(
      imageBuffer,
    )
      .resize(100, 100, {
        fit: 'inside',
      })
      .toBuffer();

    return compressedImage.toString('base64');
  }
}
