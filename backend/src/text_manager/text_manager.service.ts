import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AssetDTO } from '../assets/dto/asset.dto';
import { S3Service } from '../s3/s3.service';
import { AssetsService } from '../assets/assets.service';
import { TextractService } from '../textract/textract.service';

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

    console.log(
      'Text image data file ID: ' +
        imageDataFile.AssetID,
    );

    // Create S3 text data file
    const textDataFile =
      await this.s3Service.createAsset(
        uploadTextDTO,
      );

    console.log(
      'Text OCR data file ID: ' +
        textDataFile.AssetID,
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
      await this.s3Service.saveTextAsset(
        uploadTextDTO,
      );

    // Send textract to classify s3 image
    const textractResponse =
      await this.textractService.extractDocument(
        'sync',
        savedAssetDTO,
        'text',
      );

    this.s3Service.saveTextractResponse(
      savedAssetDTO,
      textractResponse,
    );

    return textractResponse;
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

    // get text image
    console.log(
      'Looking for image file: ' + asset.AssetID,
    );
    const newAssetDTO =
      await this.s3Service.retrieveAssetByID(
        asset.AssetID,
        asset.UserID,
      );

    // get text ocr
    console.log(
      'Looking for OCR file: ' + asset.TextID,
    );
    newAssetDTO.Content = (
      await this.s3Service.retrieveAssetByID(
        asset.TextID,
        asset.UserID,
      )
    ).Content;

    return newAssetDTO;
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
    const returnVal = base64String
      .split(';base64,')
      .pop();
    return returnVal;
  }
}
