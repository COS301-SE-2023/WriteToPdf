import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AssetDTO } from '../assets/dto/asset.dto';
import { S3Service } from '../s3/s3.service';
import { S3ServiceMock } from '../s3/__mocks__/s3.service';
import { AssetsService } from '../assets/assets.service';
import { TextractService } from '../textract/textract.service';

@Injectable()
export class TextManagerService {
  constructor(
    private readonly assetsService: AssetsService,
    private readonly s3Service: S3Service,
    private readonly s3ServiceMock: S3ServiceMock,
    private readonly textractService: TextractService,
  ) {}

  async upload(
    uploadTextDTO: AssetDTO,
    isTest = false,
  ) {
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

    // Save image data in the S3
    const savedAssetDTO =
      await this.s3Service.saveTextAssetImage(
        uploadTextDTO,
      );

    // Send textract to classify s3 image
    const textractResponse =
      await this.textractService.extractDocument(
        'sync',
        savedAssetDTO,
        'table',
      );

    this.s3Service.saveTextractResponse(
      savedAssetDTO,
      textractResponse,
    );

    return textractResponse;
  }

  async retrieveOne(
    retrieveTextDTO: AssetDTO,
    isTest = false,
  ) {
    // Retrieve text asset reference from database
    const newAssetDTO = new AssetDTO();
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

    // Get text image
    newAssetDTO.ImageBuffer =
      await this.s3Service.retrieveAssetByID(
        asset.AssetID,
        asset.UserID,
        'image',
      );

    // Further processing
    newAssetDTO.Image =
      newAssetDTO.ImageBuffer.toString('base64');

    // Get text OCR
    newAssetDTO.Content =
      await this.s3Service.retrieveAssetByID(
        asset.TextID,
        asset.UserID,
        'textractResponse',
      );

    return newAssetDTO;
  }

  /// HELPER FUNCTIONS

  removeBase64Descriptor(base64String: string) {
    const returnVal = base64String
      .split(';base64,')
      .pop();
    return returnVal;
  }

  prependBase64Descriptor(base64String: string) {
    return (
      'data:image/jpeg;base64,' + base64String
    );
  }
}
