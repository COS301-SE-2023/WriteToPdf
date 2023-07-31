import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { TextractService } from './textract.service';
import { mockClient } from 'aws-sdk-client-mock';
import {
  GetDocumentTextDetectionCommand,
  StartDocumentTextDetectionCommand,
  TextractClient,
  Block,
  DetectDocumentTextCommand,
  AnalyzeDocumentCommand,
  StartDocumentAnalysisCommand,
  GetDocumentAnalysisCommand,
} from '@aws-sdk/client-textract';
import {
  DeleteMessageCommand,
  Message,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { AssetDTO } from '../assets/dto/asset.dto';

describe('TextractService', () => {
  let textractService: TextractService;
  const mockTextractClient = mockClient(
    TextractClient,
  );
  const mockSqsClient = mockClient(SQSClient);

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [TextractService],
      }).compile();

    textractService = module.get<TextractService>(
      TextractService,
    );

    mockSqsClient.reset();
    mockTextractClient.reset();

    const blk: Block = { Text: 'Inside Block' };
    const blkRet: Block[] = [];
    blkRet.push(blk);

    mockTextractClient
      .on(StartDocumentTextDetectionCommand)
      .resolves({ JobId: '1' });

    mockTextractClient
      .on(GetDocumentTextDetectionCommand)
      .resolves({ Blocks: blkRet });

    mockTextractClient
      .on(StartDocumentAnalysisCommand)
      .resolves({ JobId: '1' });

    mockTextractClient
      .on(GetDocumentAnalysisCommand)
      .resolves({ Blocks: blkRet });

    mockTextractClient
      .on(DetectDocumentTextCommand)
      .resolves({ Blocks: blkRet });

    mockTextractClient
      .on(AnalyzeDocumentCommand)
      .resolves({ Blocks: blkRet });

    const jsonBody = {
      Message: `{"Status":"SUCCEEDED"}`,
    };
    const msg: Message = {
      ReceiptHandle: 'Inside Message',
      Body: JSON.stringify(jsonBody),
    };
    const msgRet: Message[] = [];
    msgRet.push(msg);

    mockSqsClient
      .on(ReceiveMessageCommand)
      .resolves({ Messages: msgRet });
    mockSqsClient
      .on(DeleteMessageCommand)
      .resolves({});
  });

  it('should be defined', () => {
    expect(textractService).toBeDefined();
  });

  describe('Asynchronous extract', () => {
    describe('Text Extraction', () => {
      it('should return an extraction object', async () => {
        const assetDTO = new AssetDTO();
        assetDTO.UserID = 1;
        assetDTO.AssetID = '1';

        const expectedResult = {
          Name: '1',
          ExtractType: 'text',
          Extracted: [{ Text: 'Inside Block' }],
        };

        const result =
          await textractService._extractDocumentAsynchronous(
            assetDTO,
            'text',
          );

        expect(result).toBeDefined();
        expect(result).toEqual(expectedResult);
      });
    });

    describe('Table Extraction', () => {
      it('should return an extraction object', async () => {
        const assetDTO = new AssetDTO();
        assetDTO.UserID = 1;
        assetDTO.AssetID = '1';

        const expectedResult = {
          Name: '1',
          ExtractType: 'table',
          Extracted: [{ Text: 'Inside Block' }],
        };

        const result =
          await textractService._extractDocumentAsynchronous(
            assetDTO,
            'table',
          );

        expect(result).toBeDefined();
        expect(result).toEqual(expectedResult);
      });
    });
  });

  describe('Synchronous extract', () => {
    describe('Text Extraction', () => {
      it('should return an extraction object', async () => {
        const assetDTO = new AssetDTO();
        assetDTO.UserID = 1;
        assetDTO.AssetID = '1';

        const expectedResult = {
          Blocks: [{ Text: 'Inside Block' }],
        };

        const result =
          await textractService._extractDocumentSynchronous(
            assetDTO,
            'text',
          );

        expect(result).toBeDefined();
        expect(result).toEqual(expectedResult);
      });
    });

    describe('Table Extraction', () => {
      it('should return an extraction object', async () => {
        const assetDTO = new AssetDTO();
        assetDTO.UserID = 1;
        assetDTO.AssetID = '1';

        const expectedResult = {
          Blocks: [{ Text: 'Inside Block' }],
        };

        const result =
          await textractService._extractDocumentSynchronous(
            assetDTO,
            'table',
          );

        expect(result).toBeDefined();
        expect(result).toEqual(expectedResult);
      });
    });
  });

  describe('Normal Endpoint', () => {
    describe('Synchronous', () => {
      describe('Text Extraction', () => {
        it('should return an extraction object', async () => {
          const assetDTO = new AssetDTO();
          assetDTO.UserID = 1;
          assetDTO.AssetID = '1';

          const expectedResult = {
            Blocks: [{ Text: 'Inside Block' }],
          };

          const result =
            await textractService.extractDocument(
              'sync',
              assetDTO,
              'text',
            );

          expect(result).toBeDefined();
          expect(result).toEqual(expectedResult);
        });

        it('should console log with error', async () => {
          const assetDTO = new AssetDTO();
          assetDTO.UserID = 1;
          assetDTO.AssetID = '1';

          mockTextractClient
            .on(DetectDocumentTextCommand)
            .rejects(
              new Error('Force Test Error'),
            );
          const mockConsole = jest.spyOn(
            global.console,
            'log',
          );

          await textractService.extractDocument(
            'sync',
            assetDTO,
            'text',
          );

          expect(mockConsole).toBeCalled();
          mockConsole.mockRestore();
        });
      });

      describe('Table Extraction', () => {
        it('should return an extraction object', async () => {
          const assetDTO = new AssetDTO();
          assetDTO.UserID = 1;
          assetDTO.AssetID = '1';

          const expectedResult = {
            Blocks: [{ Text: 'Inside Block' }],
          };

          const result =
            await textractService.extractDocument(
              'sync',
              assetDTO,
              'table',
            );

          expect(result).toBeDefined();
          expect(result).toEqual(expectedResult);
        });

        it('should console log with error', async () => {
          const assetDTO = new AssetDTO();
          assetDTO.UserID = 1;
          assetDTO.AssetID = '1';

          mockTextractClient
            .on(AnalyzeDocumentCommand)
            .rejects(
              new Error('Force Test Error'),
            );
          const mockConsole = jest.spyOn(
            global.console,
            'log',
          );

          await textractService.extractDocument(
            'sync',
            assetDTO,
            'table',
          );

          expect(mockConsole).toBeCalled();
          mockConsole.mockRestore();
        });
      });
    });

    describe('Asynchronous', () => {
      describe('Text Extraction', () => {
        it('should return an extraction object', async () => {
          const assetDTO = new AssetDTO();
          assetDTO.UserID = 1;
          assetDTO.AssetID = '1';

          const expectedResult = {
            Name: '1',
            ExtractType: 'text',
            Extracted: [{ Text: 'Inside Block' }],
          };

          const result =
            await textractService.extractDocument(
              'async',
              assetDTO,
              'text',
            );

          expect(result).toBeDefined();
          expect(result).toEqual(expectedResult);
        });

        it('should console log with error', async () => {
          const assetDTO = new AssetDTO();
          assetDTO.UserID = 1;
          assetDTO.AssetID = '1';

          mockTextractClient
            .on(StartDocumentTextDetectionCommand)
            .rejects(
              new Error('Force Test Error'),
            );
          const mockConsole = jest.spyOn(
            global.console,
            'log',
          );

          await textractService.extractDocument(
            'async',
            assetDTO,
            'text',
          );

          expect(mockConsole).toBeCalled();
          mockConsole.mockRestore();
        });
      });

      describe('Table Extraction', () => {
        it('should return an extraction object', async () => {
          const assetDTO = new AssetDTO();
          assetDTO.UserID = 1;
          assetDTO.AssetID = '1';

          const expectedResult = {
            Name: '1',
            ExtractType: 'table',
            Extracted: [{ Text: 'Inside Block' }],
          };

          const result =
            await textractService.extractDocument(
              'async',
              assetDTO,
              'table',
            );

          expect(result).toBeDefined();
          expect(result).toEqual(expectedResult);
        });

        it('should console log with error', async () => {
          const assetDTO = new AssetDTO();
          assetDTO.UserID = 1;
          assetDTO.AssetID = '1';

          mockTextractClient
            .on(StartDocumentAnalysisCommand)
            .rejects(
              new Error('Force Test Error'),
            );
          const mockConsole = jest.spyOn(
            global.console,
            'log',
          );

          await textractService.extractDocument(
            'async',
            assetDTO,
            'table',
          );

          expect(mockConsole).toBeCalled();
          mockConsole.mockRestore();
        });
      });
    });
  });
});
