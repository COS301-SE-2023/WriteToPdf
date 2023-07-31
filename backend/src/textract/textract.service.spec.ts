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
  JobStatus,
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

    mockTextractClient
      .on(StartDocumentTextDetectionCommand)
      .resolves({ JobId: '1' });

    const blk: Block = { Text: 'Inside Block' };
    const blkRet: Block[] = [];
    blkRet.push(blk);

    mockTextractClient
      .on(GetDocumentTextDetectionCommand)
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
        assetDTO.UserID = 16;
        assetDTO.AssetID = '1';

        const result =
          textractService._extractDocumentAsynchronous(
            assetDTO,
            'text',
          );

        expect(result).toBeDefined();
      });
    });
  });
});
