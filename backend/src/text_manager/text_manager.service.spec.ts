import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { TextManagerService } from './text_manager.service';
import { TextractService } from '../textract/textract.service';
import { AssetsService } from '../assets/assets.service';
import { S3Service } from '../s3/s3.service';
import { S3ServiceMock } from '../s3/__mocks__/s3.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from '../assets/entities/asset.entity';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import * as CryptoJS from 'crypto-js';
import { AssetDTO } from '../assets/dto/asset.dto';
import {
  HttpException,
  HttpStatus,
} from '@nestjs/common';

describe('TextManagerService', () => {
  let service: TextManagerService;
  let assetsService: AssetsService;
  let s3Service: S3Service;
  let textractService: TextractService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          TextManagerService,
          AssetsService,
          S3Service,
          S3ServiceMock,
          {
            provide: getRepositoryToken(Asset),
            useClass: Repository,
          },
          AuthService,
          JwtService,
          TextractService,
        ],
      }).compile();

    service = module.get<TextManagerService>(
      TextManagerService,
    );
    assetsService = module.get<AssetsService>(
      AssetsService,
    );
    s3Service = module.get<S3Service>(S3Service);
    textractService = module.get<TextractService>(
      TextractService,
    );
  });

  describe('upload', () => {
    it('should upload asset', async () => {
      jest
        .spyOn(CryptoJS, 'SHA256')
        .mockResolvedValue(
          'mock sha256 hash string',
        );

      const uploadTextDTO = new AssetDTO();
      uploadTextDTO.UserID = 1;

      const assetDTO = new AssetDTO();

      jest
        .spyOn(s3Service, 'createAsset')
        .mockResolvedValue(assetDTO);

      jest
        .spyOn(Repository.prototype, 'create')
        .mockReturnValue(assetDTO);

      jest
        .spyOn(Repository.prototype, 'save')
        .mockReturnValue(assetDTO as any);

      jest.spyOn(assetsService, 'saveAsset');

      jest
        .spyOn(service, 'removeBase64Descriptor')
        .mockResolvedValue(
          'mock content' as never,
        );

      jest
        .spyOn(s3Service, 'saveTextAssetImage')
        .mockResolvedValue(assetDTO);

      jest
        .spyOn(textractService, 'extractDocument')
        .mockResolvedValue(
          'mock textract response' as any,
        );

      (
        jest.spyOn(
          service,
          'formatTextractResponse',
        ) as any
      ).mockResolvedValue(
        'mock formatted response',
      );

      jest
        .spyOn(s3Service, 'saveTextractResponse')
        .mockResolvedValue(assetDTO);

      jest
        .spyOn(Buffer, 'from')
        .mockReturnValue('mock buffer' as any);

      const response = await service.upload(
        uploadTextDTO,
      );

      expect(response).toBe(
        'mock formatted response',
      );
    });
  });

  describe('retrieveOne', () => {
    it('should retrieve asset', async () => {
      const retrieveTextDTO = new AssetDTO();
      retrieveTextDTO.AssetID = 'mock asset id';
      retrieveTextDTO.Format = 'text';
      retrieveTextDTO.Content = 'mock content';

      const assetDTO = new AssetDTO();

      jest
        .spyOn(Repository.prototype, 'findOne')
        .mockReturnValue(assetDTO as any);

      jest
        .spyOn(assetsService, 'retrieveOne')
        .mockReturnValue(assetDTO as any);

      jest
        .spyOn(s3Service, 'retrieveAssetByID')
        .mockResolvedValue(
          Buffer.from('mock buffer') as any,
        );

      jest
        .spyOn(s3Service, 'retrieveAssetByID')
        .mockResolvedValue(
          '{textract: response}',
        );

      const response = await service.retrieveOne(
        retrieveTextDTO,
      );

      expect(response.Image).toBe(
        '{textract: response}',
      );
    });

    it('should throw error if asset not found', async () => {
      const retrieveTextDTO = new AssetDTO();
      retrieveTextDTO.AssetID = 'mock asset id';
      retrieveTextDTO.Format = 'text';
      retrieveTextDTO.Content = 'mock content';
      jest
        .spyOn(Repository.prototype, 'findOne')
        .mockReturnValue(null);

      jest
        .spyOn(assetsService, 'retrieveOne')
        .mockReturnValue(null);
      try {
        const response =
          await service.retrieveOne(
            retrieveTextDTO,
          );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Asset not found, check AssetID and Format',
        );
        expect(error.status).toBe(
          HttpStatus.NOT_FOUND,
        );
      }
    });
  });

  describe('removeBase64Descriptor', () => {
    it('should remove base64 descriptor', async () => {
      const response =
        service.removeBase64Descriptor(
          'data:image/jpeg;base64,mock base64 string',
        );
      expect(response).toBe('mock base64 string');
    });
  });

  describe('prependBase64Descriptor', () => {
    it('should prepend base64 descriptor', async () => {
      const response =
        service.prependBase64Descriptor(
          'mock base64 string',
        );
      expect(response).toBe(
        'data:image/jpeg;base64,mock base64 string',
      );
    });
  });

  describe('findBlockByID', () => {
    it('should find block by id', () => {
      const block = {
        Id: 'mock id',
      };
      const response = service.findBlockByID(
        'mock id',
        [block],
      );
      expect(response).toBe(block);
    });
  });

  describe('formatTextractResponse', () => {
    it('should return null if there is no response', () => {
      const result =
        service.formatTextractResponse(null);

      expect(result).toBe(null);
    });

    it('should format the textract response', () => {
      const jsResponse = {
        Blocks: [
          {
            BlockType: 'LINE',
            Id: 'mock id',
            Text: 'mock text',
          },
        ],
      };

      const jsonString =
        JSON.stringify(jsResponse);
      const response = JSON.parse(jsonString);

      jest
        .spyOn(service, 'categoriseBlocks')
        .mockImplementation(
          (rawLines, tableRoots, allBlocks) => {
            rawLines.push(response['Blocks'][0]);
          },
        );

      jest
        .spyOn(service, 'findFreeLines')
        .mockReturnValue([response['Blocks'][0]]);

      jest
        .spyOn(service, 'groupLines')
        .mockReturnValue([response['Blocks'][0]]);

      jest
        .spyOn(service, 'concatenateTextLines')
        .mockReturnValue([
          {
            Lines: response['Blocks'][0].Text,
            Top: 0,
          },
        ]);

      jest
        .spyOn(service, 'constructTables')
        .mockReturnValue([]);

      jest
        .spyOn(service, 'sortElements')
        .mockImplementation();

      jest
        .spyOn(service, 'mergeTextElements')
        .mockImplementation((elements) => {
          return elements;
        });

      jest
        .spyOn(service, 'findTableIndices')
        .mockReturnValue([]);

      const result =
        service.formatTextractResponse(response);

      expect(result).toStrictEqual({
        'Num Elements': 1,
        'Table Indices': [],
        elements: [
          {
            'Text Element': {
              Top: 0,
              Lines: 'mock text',
            },
          },
        ],
      });
    });
  });

  describe('categoriseBlocks', () => {
    it('should categorise blocks', () => {
      const rawLines = [];
      const tableRoots = [];
      const allBlocks = [
        {
          BlockType: 'LINE',
          Id: '1',
          Text: 'mock text',
        },
        {
          BlockType: 'TABLE',
          Id: '2',
          Text: 'mock text',
        },
      ];

      service.categoriseBlocks(
        rawLines,
        tableRoots,
        allBlocks,
      );

      expect(rawLines).toStrictEqual([
        allBlocks[0],
      ]);
      expect(tableRoots).toStrictEqual([
        allBlocks[1],
      ]);
    });
  });

  describe('findFreeLines', () => {
    it('should find free lines', () => {
      const allBlocks = [
        {
          BlockType: 'LINE',
          Id: '1',
          Text: 'mock text',
        },
        {
          BlockType: 'LINE',
          Id: '2',
          Text: 'mock text',
        },
        {
          BlockType: 'LINE',
          Id: '3',
          Text: 'mock text',
        },
        {
          BlockType: 'TABLE',
          Id: '4',
          Text: 'mock text',
        },
      ];
      const rawLines = [
        allBlocks[0],
        allBlocks[1],
        allBlocks[2],
      ];

      const tableRoots = [allBlocks[3]];

      jest
        .spyOn(service, 'isPartOfTable')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      const result = service.findFreeLines(
        rawLines,
        tableRoots,
        allBlocks,
      );

      expect(result).toStrictEqual([
        allBlocks[0],
        allBlocks[1],
      ]);
    });
  });

  describe('groupLines', () => {
    it('should group lines', () => {
      const freeLines = [
        {
          BlockType: 'LINE',
          Id: '1',
          Text: 'mock text',
          Geometry: {
            BoundingBox: {
              Top: 0,
            },
          },
        },
        {
          BlockType: 'LINE',
          Id: '2',
          Text: 'mock text',
          Geometry: {
            BoundingBox: {
              Top: 0,
            },
          },
        },
        {
          BlockType: 'LINE',
          Id: '3',
          Text: 'mock text',
          Geometry: {
            BoundingBox: {
              Top: 1,
            },
          },
        },
      ];

      const result =
        service.groupLines(freeLines);

      expect(result).toStrictEqual([
        [freeLines[0], freeLines[1]],
        [freeLines[2]],
      ]);
    });
  });

  describe('concatenateTextLines', () => {
    it('should concatenate text lines', () => {
      const lines = [
        [
          {
            Text: 'mock text',
            Geometry: {
              BoundingBox: {
                Top: 0,
              },
            },
          },
          {
            Text: 'mock text',
            Geometry: {
              BoundingBox: {
                Top: 0,
              },
            },
          },
        ],
        [
          {
            Text: 'mock text',
            Geometry: {
              BoundingBox: {
                Top: 1,
              },
            },
          },
        ],
      ];

      const result =
        service.concatenateTextLines(lines);

      expect(result).toStrictEqual([
        {
          Lines: 'mock text\tmock text',
          Top: 0,
        },
        {
          Lines: 'mock text',
          Top: 1,
        },
      ]);
    });
  });

  describe('constructTables', () => {
    it('should construct tables', () => {
      const allBlocks = [
        {
          BlockType: 'TABLE',
          Id: '1',
          Geometry: {
            BoundingBox: {
              Top: 0,
            },
          },
        },
        {
          BlockType: 'TABLE',
          Id: '2',
          Geometry: {
            BoundingBox: {
              Top: 1,
            },
          },
        },
      ];
      const tableRoots = [
        allBlocks[0],
        allBlocks[1],
      ];

      const table1: string[][] = [];
      table1.push(['mock text1']);
      const table2: string[][] = [];
      table2.push(['mock text2']);

      jest
        .spyOn(service, 'createTable')
        .mockReturnValueOnce(table1)
        .mockReturnValueOnce(table2);

      const result = service.constructTables(
        tableRoots,
        allBlocks,
      );

      expect(result).toStrictEqual([
        {
          Top: tableRoots[0].Geometry.BoundingBox
            .Top,
          Table: table1,
        },
        {
          Top: tableRoots[1].Geometry.BoundingBox
            .Top,
          Table: table2,
        },
      ]);
    });
  });

  describe('sortElements', () => {
    it('should sort elements', () => {
      const elements = [
        {
          'Text Element': {
            Top: 1,
          },
        },
        {
          'Text Element': {
            Top: 0,
          },
        },
        {
          'Table Element': {
            Top: 0.5,
          },
        },
      ];

      service.sortElements(elements);

      expect(elements).toStrictEqual([
        {
          'Text Element': {
            Top: 0,
          },
        },
        {
          'Table Element': {
            Top: 0.5,
          },
        },
        {
          'Text Element': {
            Top: 1,
          },
        },
      ]);
    });
  });

  describe('findTableIndices', () => {
    it('should find table indices', () => {
      const elements = [
        {
          'Text Element': {
            Top: 0,
          },
        },
        {
          'Table Element': {
            Top: 0.5,
          },
        },
        {
          'Text Element': {
            Top: 1,
          },
        },
      ];

      const result =
        service.findTableIndices(elements);

      expect(result).toStrictEqual([1]);
    });
  });

  describe('mergeTextElements', () => {
    it('should merge text elements', () => {
      const elements = [
        {
          'Text Element': {
            Top: 0,
            Lines: 'mock text',
          },
        },
        {
          'Text Element': {
            Top: 0,
            Lines: 'mock text',
          },
        },
        {
          'Table Element': {
            Top: 0.5,
          },
        },
        {
          'Text Element': {
            Top: 1,
            Lines: 'mock text',
          },
        },
        {
          'Text Element': {
            Top: 1,
            Lines: 'mock text',
          },
        },
      ];

      const result =
        service.mergeTextElements(elements);

      expect(result).toStrictEqual([
        {
          'Text Element': {
            Top: 0,
            Lines: 'mock text\nmock text',
          },
        },
        {
          'Table Element': {
            Top: 0.5,
          },
        },
        {
          'Text Element': {
            Top: 1,
            Lines: 'mock text\nmock text',
          },
        },
      ]);
    });
  });

  describe('createTable', () => {
    it('should create table', () => {
      const allBlocks = [
        {
          BlockType: 'CELL',
          Id: '1',
          Text: 'mock text',
          Geometry: {
            BoundingBox: {
              Top: 0,
            },
          },
          Relationships: ['line1'],
        },
        {
          BlockType: 'CELL',
          Id: '2',
          Text: 'mock text',
          Geometry: {
            BoundingBox: {
              Top: 0.5,
            },
          },
          Relationships: ['line2'],
        },
        {
          BlockType: 'CELL',
          Id: '3',
          Text: 'mock text',
          Geometry: {
            BoundingBox: {
              Top: 1,
            },
          },
          Relationships: ['line3'],
        },
        {
          BlockType: 'TABLE',
          Id: 'mock id',
          Relationships: [
            {
              Type: 'CHILD',
              Ids: ['1', '2', '3'],
            },
          ],
        },
      ];

      const tableRoot = allBlocks[3];

      jest
        .spyOn(service, 'findBlockByID')
        .mockReturnValueOnce(allBlocks[0])
        .mockReturnValueOnce(allBlocks[1])
        .mockReturnValueOnce(allBlocks[2]);

      jest
        .spyOn(service, 'findTextBlocksInCell')
        .mockReturnValueOnce([allBlocks[0].Text])
        .mockReturnValueOnce([allBlocks[1].Text])
        .mockReturnValueOnce([allBlocks[2].Text]);

      jest
        .spyOn(service, 'fillCell')
        .mockImplementation(
          (table, cell, text) => {
            table.push([text]);
          },
        );

      const result = service.createTable(
        tableRoot,
        allBlocks,
      );

      expect(result).toStrictEqual([
        ['mock text'],
        ['mock text'],
        ['mock text'],
      ]);
    });
  });

  describe('findTextBlocksInCell', () => {
    it('should find text blocks in cell', () => {
      const allBlocks = [
        {
          BlockType: 'LINE',
          Id: '1',
          Text: 'mock text1',
        },
        {
          BlockType: 'LINE',
          Id: '2',
          Text: 'mock text2',
        },
        {
          BlockType: 'LINE',
          Id: '3',
          Text: 'mock text3',
        },
        {
          BlockType: 'CELL',
          Id: 'mock id',
          Relationships: [
            {
              Type: 'CHILD',
              Ids: ['1', '2', '3'],
            },
          ],
        },
      ];

      const cell = allBlocks[3];

      jest
        .spyOn(service, 'findBlockByID')
        .mockReturnValueOnce(allBlocks[0])
        .mockReturnValueOnce(allBlocks[1])
        .mockReturnValueOnce(allBlocks[2]);

      const result = service.findTextBlocksInCell(
        cell,
        allBlocks,
      );

      expect(result).toStrictEqual([
        allBlocks[0].Text,
        allBlocks[1].Text,
        allBlocks[2].Text,
      ]);
    });
  });

  describe('fillCell', () => {
    it('should fill cell', () => {
      const cellBlock = {
        BlockType: 'CELL',
        RowIndex: 1,
        ColumnIndex: 1,
      };

      const table = [];

      jest
        .spyOn(service, 'fillMissingCols')
        .mockImplementation();

      service.fillCell(
        table,
        cellBlock,
        'mock text',
      );
    });
  });

  describe('fillMissingCols', () => {
    it('should fill missing cols', () => {
      const table = [['r1c1', 'r1c2']];
      const rowIndex = 0;
      const colIndex = 2;

      service.fillMissingCols(
        table,
        rowIndex,
        colIndex,
      );

      expect(table).toStrictEqual([
        ['r1c1', 'r1c2', ' '],
      ]);
    });
  });

  describe('isPartOfTable', () => {
    it('should return false if block is not part of table', () => {
      const allBlocks = [
        {
          BlockType: 'TABLE',
          Id: '1',
          Relationships: [
            {
              Type: 'CHILD',
              Ids: ['2', '3'],
            },
          ],
        },
        {
          BlockType: 'CELL',
          Id: '2',
          Relationships: [
            {
              Type: 'CHILD',
              Ids: ['5'],
            },
          ],
        },
        {
          BlockType: 'CELL',
          Id: '3',
        },
        {
          BlockType: 'WORD',
          Id: '5',
          Text: 'mock text',
        },
        {
          BlockType: 'LINE',
          Id: '6',
          Relationships: [
            {
              Type: 'WORD',
              Ids: ['7'],
            },
          ],
        },
        {
          BlockType: 'WORD',
          Id: '7',
          Text: 'mock text',
        },
      ];

      const table = allBlocks[0];
      const line = allBlocks[4];

      jest
        .spyOn(service, 'findBlockByID')
        .mockReturnValueOnce(allBlocks[1])
        .mockReturnValueOnce(allBlocks[2])
        .mockReturnValueOnce(allBlocks[3]);

      const result = service.isPartOfTable(
        table,
        line,
        allBlocks,
      );

      expect(result).toBe(false);
    });
    it('should return true if block is part of table', () => {
      const allBlocks = [
        {
          BlockType: 'TABLE',
          Id: '1',
          Relationships: [
            {
              Type: 'CHILD',
              Ids: ['2', '3'],
            },
          ],
        },
        {
          BlockType: 'CELL',
          Id: '2',
          Relationships: [
            {
              Type: 'CHILD',
              Ids: ['5'],
            },
          ],
        },
        {
          BlockType: 'CELL',
          Id: '3',
        },
        {
          BlockType: 'LINE',
          Id: '4',
          Relationships: [
            {
              Type: 'WORD',
              Ids: ['5'],
            },
          ],
        },
        {
          BlockType: 'WORD',
          Id: '5',
          Text: 'mock text',
        },
      ];

      const table = allBlocks[0];
      const line = allBlocks[3];

      jest
        .spyOn(service, 'findBlockByID')
        .mockReturnValueOnce(allBlocks[1])
        .mockReturnValueOnce(allBlocks[2])
        .mockReturnValueOnce(allBlocks[3])
        .mockReturnValueOnce(allBlocks[4]);

      const result = service.isPartOfTable(
        table,
        line,
        allBlocks,
      );

      expect(result).toBe(true);
    });
  });
});
