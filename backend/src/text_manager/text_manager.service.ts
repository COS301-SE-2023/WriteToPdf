import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AssetDTO } from '../assets/dto/asset.dto';
import { S3Service } from '../s3/s3.service';
import { AssetsService } from '../assets/assets.service';
import { TextractService } from '../textract/textract.service';
import * as fs from 'fs';

@Injectable()
export class TextManagerService {
  constructor(
    private readonly assetsService: AssetsService,
    private readonly s3Service: S3Service,
    private readonly textractService: TextractService,
  ) {}

  async upload(uploadTextDTO: AssetDTO) {
    // Create S3 image data file
    const imageDataFile =
      await this.s3Service.createAsset(
        uploadTextDTO,
      );

    // Create S3 text data file
    const textDataFile =
      await this.s3Service.createAsset(
        uploadTextDTO,
      );

    // Save text asset in database
    uploadTextDTO.AssetID = imageDataFile.AssetID;
    uploadTextDTO.TextID = textDataFile.AssetID;
    uploadTextDTO.Content = uploadTextDTO.Image;
    uploadTextDTO.Image = '';
    this.assetsService.saveAsset(uploadTextDTO);

    // Strip base64 descriptor
    uploadTextDTO.Content =
      this.removeBase64Descriptor(
        uploadTextDTO.Content,
      );

    // Create buffer from base64 image
    uploadTextDTO.ImageBuffer = Buffer.from(
      uploadTextDTO.Content,
      'base64',
    );

    // use fs-promises to save a file
    await fs.writeFile(
      `./storage/test/${uploadTextDTO.AssetID}.jpeg`,
      uploadTextDTO.ImageBuffer,
      (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('The file was saved!');
        }
      },
    );
    // Save image data in the S3
    const savedAssetDTO =
      await this.s3Service.saveAsset(
        uploadTextDTO,
      );

    console.log(
      'textmanagerservice.upload: ',
      savedAssetDTO,
    );

    // Send textract to classify s3 image
    const OCRResponse =
      this.textractService.extractDocument(
        'sync',
        savedAssetDTO,
        'text',
      );

    return OCRResponse;
  }

  async retrieveOne(retrieveTextDTO: AssetDTO) {
    // Retrieve text asset reference from database
    const asset =
      await this.assetsService.retrieveOne(
        retrieveTextDTO,
      );

    // AssetID does not exist as specified asset type
    if (!asset) {
      throw new HttpException(
        'Asset not found, check AssetID and Format',
        HttpStatus.NOT_FOUND,
      );
    }

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

  removeBase64Descriptor(base64String: string) {
    console.log('base64String', base64String);
    const returnVal = base64String
      .split(';base64,')
      .pop();
    console.log('returnVal', returnVal);
    return returnVal;
  }
}
