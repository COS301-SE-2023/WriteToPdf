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
        uploadTextDTO.Format,
      );

    const s3TextractResponse =
      await this.s3Service.saveTextractResponse(
        savedAssetDTO,
    const formattedTextractResponse =
      this.formatTextractResponse(
        textractResponse,
      );

    this.s3Service.saveTextractResponse(
      savedAssetDTO,
      formattedTextractResponse,
    );

    return formattedTextractResponse;
  }

  formatTextractResponse(response: JSON) {
    if (!response) return null;
    const rawLines = [];
    const tableRoot = [];
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
        tableRoot.push(response['Blocks'][block]);
      }
    }

    const freeLines = rawLines.slice();
    for (const line of rawLines) {
      for (const root of tableRoot) {
        if (
          this.isPartOfTable(
            root,
            line,
            response['Blocks'],
          )
        ) {
          freeLines.splice(
            freeLines.indexOf(line),
            1,
          );
        }
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
      concatenatedTextLines.push({
        Top: group[0].Geometry.BoundingBox.Top,
        Lines: concatenatedLine,
      });
    }

    const tables = [];
    for (const root of tableRoot) {
      const table = this.createTable(
        root,
        response['Blocks'],
      );
      tables.push({
        Top: root.Geometry.BoundingBox.Top,
        Table: table,
      });
    }

    // Create an array to hold elements (text and table)
    const elements: {
      'Text Element'?: {
        Top: number;
        Lines: string[];
      };
      'Table Element'?: {
        Top: number;
        rows: number;
        cols: number;
        Table: string[][];
      };
    }[] = [];

    // Add text elements
    for (const line of concatenatedTextLines) {
      const textElement = {
        'Text Element': {
          Top: line.Top,
          Lines: line.Lines,
        },
      };
      elements.push(textElement);
    }

    // Add table elements
    for (const table of tables) {
      if (!table) continue;
      const numRows = table.Table.length;
      const numCols = Math.max(
        ...table.Table.map((row) => row.length),
      );

      const tableElement = {
        'Table Element': {
          Top: table.Top,
          rows: numRows,
          cols: numCols,
          Table: table.Table,
        },
      };
      elements.push(tableElement);
    }

    // Sort the elements based on their top position
    elements.sort((a, b) => {
      let topA, topB;

      // Extract the "Top" property for Text Elements
      if (a['Text Element']) {
        topA = a['Text Element'].Top;
      } else if (a['Table Element']) {
        topA = a['Table Element'].Top;
      }

      // Extract the "Top" property for Table Elements
      if (b['Text Element']) {
        topB = b['Text Element'].Top;
      } else if (b['Table Element']) {
        topB = b['Table Element'].Top;
      }

      // Compare and sort in ascending order
      return topA - topB;
    });

    const mergedElements =
      this.mergeTextElements(elements);

    // Find the indices of the table elements
    const tableIndices = [];
    for (const el of mergedElements) {
      if (el['Table Element']) {
        tableIndices.push(
          mergedElements.indexOf(el),
        );
      }
    }

    // Create the JSON object
    const jsonObject = {
      'Num Elements': mergedElements.length,
      'Table Indices': tableIndices,
      elements: mergedElements,
    };

    // Return the JSON object
    return jsonObject;
  }

  mergeTextElements(elements) {
    const mergedElements = [];
    for (const element of elements) {
      if (mergedElements.length == 0) {
        mergedElements.push(element);
      } else if (element['Text Element']) {
        const lastElement =
          mergedElements[
            mergedElements.length - 1
          ];
        // If the last element is also a text element, merge the two
        if (lastElement['Text Element']) {
          const mergedTextElement = {
            'Text Element': {
              Top: lastElement['Text Element']
                .Top,
              Lines:
                lastElement['Text Element']
                  .Lines +
                '\n' +
                element['Text Element'].Lines,
            },
          };
          mergedElements[
            mergedElements.length - 1
          ] = mergedTextElement;
        } else {
          // Otherwise if the last element is a table element, add the text element
          mergedElements.push(element);
        }
      } else {
        mergedElements.push(element);
      }
    }
    return mergedElements;
  }

  createTable(
    tableRoot: any,
    allBlocks: any,
  ): any {
    if (!tableRoot) return null;
    const table: string[][] = [];
    // Loop through the CHILD relationships of the table root element
    for (const childId of tableRoot.Relationships.find(
      (rel) => rel.Type === 'CHILD',
    )?.Ids || []) {
      // Find the CELL block with the childId
      const cellBlock = this.findBlockByID(
        childId,
        allBlocks,
      );

      if (cellBlock) {
        // If the CELL has CHILD relationships, find and concatenate the text blocks
        if (
          cellBlock.Relationships &&
          cellBlock.Relationships.length > 0
        ) {
          const textBlocks: string[] = [];

          for (const childId of cellBlock.Relationships.find(
            (rel) => rel.Type === 'CHILD',
          )?.Ids || []) {
            const textBlock = this.findBlockByID(
              childId,
              allBlocks,
            );
            if (textBlock && textBlock.Text) {
              textBlocks.push(textBlock.Text);
            }
          }

          // Concatenate the text blocks with spaces and remove leading/trailing spaces
          const concatenatedText = textBlocks
            .join(' ')
            .trim();

          // Add the concatenated text to the table at the specified row and column
          const rowIndex = cellBlock.RowIndex - 1; // Adjust for 0-based indexing
          const colIndex =
            cellBlock.ColumnIndex - 1; // Adjust for 0-based indexing

          // Ensure the row exists in the table
          table[rowIndex] = table[rowIndex] || [];

          // Fill any missing columns with empty cells
          while (
            table[rowIndex].length <= colIndex
          ) {
            table[rowIndex].push(' ');
          }

          // Set the concatenated text in the specified cell
          table[rowIndex][colIndex] =
            concatenatedText;
        }
      }
    }
    return table;
  }

  isPartOfTable(table, line, allBlocks) {
    if (!table) return false;
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
