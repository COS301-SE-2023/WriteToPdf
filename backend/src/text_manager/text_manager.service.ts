import { Injectable } from '@nestjs/common';
import { AssetDTO } from '../assets/dto/asset.dto';
import { S3Service } from '../s3/s3.service';
import { AssetsService } from '../assets/assets.service';
import { SHA256 } from 'crypto-js';

@Injectable()
export class TextManagerService {
  constructor(
    private readonly assetsService: AssetsService,
    private readonly s3Service: S3Service,
  ) {}

  upload(uploadTextDTO: AssetDTO) {
    // Generate AssetID
    uploadTextDTO.AssetID = SHA256(
      uploadTextDTO.UserID.toString() +
        new Date().getTime().toString(),
    ).toString();

    if (!uploadTextDTO.ConvertedElement) {
      uploadTextDTO.ConvertedElement = '';
    }

    // Simulate OCR-generated text
    if (!uploadTextDTO.Content) {
      uploadTextDTO.Content =
        'The quick brown fox, jumped over the hill. From there it obtained a degree. After that it took over the world.';
    }

    // Save text asset in database
    const imageData = uploadTextDTO.Image;
    uploadTextDTO.Image = '';
    this.assetsService.saveAsset(uploadTextDTO);
    uploadTextDTO.Image = imageData;

    // Preprocess text for storage in the S3
    uploadTextDTO.Content = this.packageTextForS3(
      uploadTextDTO,
    );

    // Save asset in the S3/local storage
    return this.s3Service.saveAsset(
      uploadTextDTO,
    );
  }

  async retrieveOne(retrieveTextDTO: AssetDTO) {
    // Retrieve text asset reference from database
    const asset =
      await this.assetsService.retrieveOne(
        retrieveTextDTO,
      );

    // Retrieve text asset from S3
    const assetDTO =
      await this.s3Service.retrieveAssetByID(
        asset.AssetID,
        asset.UserID,
      );

    return this.parseS3Content(assetDTO);
  }

  /// HELPER FUNCTIONS

  packageTextForS3(uploadTextDTO: AssetDTO) {
    let newContent = '';
    newContent += uploadTextDTO.Content.length;
    newContent += '\n';
    newContent += uploadTextDTO.Content;
    newContent += uploadTextDTO.Image;
    return newContent;
  }

  parseS3Content(assetDTO: AssetDTO) {
    // Get length of entire file
    const fileLength = assetDTO.Content.length;

    // Get length of text content in S3 file
    const contentLengthBound =
      assetDTO.Content.indexOf('\n');

    // Get length of text content in S3 file
    const textLength = parseInt(
      assetDTO.Content.substring(
        0,
        contentLengthBound,
      ),
    );

    const endOfText =
      contentLengthBound + textLength + 1;

    // Parse text content in S3 file
    const textComponent =
      assetDTO.Content.substring(
        contentLengthBound + 1,
        endOfText,
      );

    // Parse image content in S3 file
    assetDTO.Image = assetDTO.Content.substring(
      endOfText,
      fileLength,
    );

    assetDTO.Content = textComponent;
    return assetDTO;
  }
}
