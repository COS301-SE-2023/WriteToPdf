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
    // TODO should this always be 'table'?
    const textractResponse =
      await this.textractService.extractDocument(
        'sync',
        savedAssetDTO,
        'table',
      );

    // TODO should the conversion happen here? What is the textract response? Is the JSON object stored in S3?
    // TODO need way to test this. What is this textract connected to?

    // 1D array of strings (lines)
    // 2D array rows & cols for table

    this.s3Service.saveTextractResponse(
      savedAssetDTO,
      textractResponse,
    );

    return textractResponse;
  }

  formatTextractReponse(response: JSON) {
    const rawLines = [];
    let tableRoot = {};
    for (const block in response['Blocks']) {
      if (
        response['Blocks'][block].BlockType ==
        'LINE'
      ) {
        rawLines.push(response['Blocks'][block]);
      }
      if (
        response['Blocks'][block].BlockType ==
        'TABLE'
      ) {
        tableRoot = response['Blocks'][block];
      }
    }

    const freeLines = [];
    const tableLines = [];
    for (const line of rawLines) {
      if (
        !this.isPartOfTable(
          tableRoot,
          line,
          response['Blocks'],
        )
      ) {
        freeLines.push(line);
      } else {
        tableLines.push(line);
      }
    }

    // Group together lines that are close to each other vertically
    const groupedLines = [];
    for (const line of freeLines) {
      if (groupedLines.length == 0) {
        groupedLines.push([line]);
      } else {
        const lastGroup =
          groupedLines[groupedLines.length - 1];
        const lastLine =
          lastGroup[lastGroup.length - 1];
        if (
          Math.abs(
            lastLine.Geometry.BoundingBox.Top -
              line.Geometry.BoundingBox.Top,
          ) < 0.005
        ) {
          lastGroup.push(line);
        } else {
          groupedLines.push([line]);
        }
      }
    }
    const concatenatedTextLines = [];
    for (const group of groupedLines) {
      const concatenatedLine = group
        .map((line) => line.Text)
        .join('\t');
      concatenatedTextLines.push(
        concatenatedLine,
      );
    }
  }

  isPartOfTable(table, line, allBlocks) {
    // Iterate through the relationships of the table (which are CELLs)
    for (const cellID of table.Relationships[0]
      .Ids) {
      const cellBlock = this.findBlockByID(
        cellID,
        allBlocks,
      );

      // If the cell is empty skip it
      if (!cellBlock.Relationships) continue;

      // Iterate through the relationships of the CELL (which are WORDs)
      for (const cellWordID of cellBlock
        .Relationships[0].Ids) {
        // Iterate through the relationships of the LINE (which are WORDs)
        for (const lineWordID of line
          .Relationships[0].Ids) {
          if (cellWordID == lineWordID) {
            return true;
          }
        }
      }
    }
    return false;
  }

  findBlockByID(id, blocks) {
    for (const block of blocks) {
      if (block.Id === id) {
        return block;
      }
    }
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
