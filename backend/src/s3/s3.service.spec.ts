import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { S3Service } from './s3.service';
import {
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { sdkStreamMixin } from '@aws-sdk/util-stream-node';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import * as fs from 'fs/promises';
import { mockClient } from 'aws-sdk-client-mock';
import { FileDTO } from './dto/file.dto';
import { AssetDTO } from '../assets/dto/asset.dto';
import { Readable } from 'stream';

describe('S3Service', () => {
  let s3Service: S3Service;
  const mockS3Client = mockClient(S3Client);

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [S3Service],
      }).compile();

    s3Service = module.get<S3Service>(S3Service);
    // Configure mockS3Client
    mockS3Client.reset();
    const stream = new Readable();
    stream.push('hello world');
    stream.push(null); // end of stream
    stream.pipe(process.stdout);
    const sdkStream = sdkStreamMixin(stream);
    mockS3Client
      .on(GetObjectCommand)
      .resolves({ Body: sdkStream });

    jest.mock('fs/promises');
    jest.mock('@aws-sdk/client-s3');
  });

  describe('FileDTO', () => {
    it('should be initialized with default values', () => {
      const fileDTO = new FileDTO();

      expect(fileDTO.UserID).toBeUndefined();
      expect(fileDTO.FileName).toBeUndefined();
      expect(
        fileDTO.ParentDirectory,
      ).toBeUndefined();
    });
  });

  describe('deleteFile', () => {
    it('should delete file with non-empty path', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = 'mock_id';
      markdownFileDTO.Path = 'mock_path';
      markdownFileDTO.UserID = 1;

      jest
        .spyOn(fs, 'access')
        .mockResolvedValue(undefined);

      jest
        .spyOn(fs, 'unlink')
        .mockResolvedValue(undefined);

      const result = await s3Service.deleteFile(
        markdownFileDTO,
      );

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(
        MarkdownFileDTO,
      );
      expect(result).toEqual(markdownFileDTO);
    });

    it('should delete file with empty path', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = 'mock_id';
      markdownFileDTO.Path = '';
      markdownFileDTO.UserID = 1;

      jest
        .spyOn(fs, 'access')
        .mockResolvedValue(undefined);

      jest
        .spyOn(fs, 'unlink')
        .mockResolvedValue(undefined);

      const result = await s3Service.deleteFile(
        markdownFileDTO,
      );

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(
        MarkdownFileDTO,
      );
      expect(result).toEqual(markdownFileDTO);
    });

    // it('should return undefined when no local file', async () => {
    //   const markdownFileDTO =
    //     new MarkdownFileDTO();
    //   markdownFileDTO.MarkdownID = 'mock_id';
    //   markdownFileDTO.Path = 'mock_path';
    //   markdownFileDTO.UserID = 1;

    //   jest
    //     .spyOn(fs, 'access')
    //     .mockImplementation(() => {
    //       throw new Error('Directory Test Error');
    //     });
    //   jest
    //     .spyOn(fs, 'unlink')
    //     .mockResolvedValue(undefined);

    //   const result = await s3Service.deleteFile(
    //     markdownFileDTO,
    //   );

    //   expect(result).toBeUndefined();
    // });

    // it('should return undefined when delete fails', async () => {
    //   const markdownFileDTO =
    //     new MarkdownFileDTO();
    //   markdownFileDTO.MarkdownID = 'mock_id';
    //   markdownFileDTO.Path = 'mock_path';
    //   markdownFileDTO.UserID = 1;

    //   jest
    //     .spyOn(fs, 'access')
    //     .mockResolvedValue(undefined);

    //   jest
    //     .spyOn(fs, 'unlink')
    //     .mockImplementation(() => {
    //       throw new Error('Directory Test Error');
    //     });

    //   const result = await s3Service.deleteFile(
    //     markdownFileDTO,
    //   );

    //   expect(result).toBeUndefined();
    // });
  });

  describe('createFile', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should create file', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = 'mock_id';
      markdownFileDTO.Path = 'mock_path';
      markdownFileDTO.UserID = 1;

      jest
        .spyOn(fs, 'mkdir')
        .mockResolvedValue('success');

      jest
        .spyOn(fs, 'writeFile')
        .mockResolvedValue(undefined);

      const result = await s3Service.createFile(
        markdownFileDTO,
      );

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(
        MarkdownFileDTO,
      );
      expect(result).toEqual(markdownFileDTO);
    });

    it('should create file with empty path', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = 'mock_id';
      markdownFileDTO.Path = '';
      markdownFileDTO.UserID = 1;

      jest
        .spyOn(fs, 'mkdir')
        .mockResolvedValue('success');

      jest
        .spyOn(fs, 'writeFile')
        .mockResolvedValue(undefined);

      const result = await s3Service.createFile(
        markdownFileDTO,
      );

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(
        MarkdownFileDTO,
      );
      expect(result).toEqual(markdownFileDTO);
    });

    // it("should return undefined when directory can't be created", async () => {
    //   const markdownFileDTO =
    //     new MarkdownFileDTO();
    //   markdownFileDTO.MarkdownID = 'mock_id';
    //   markdownFileDTO.Path = 'mock_path';
    //   markdownFileDTO.UserID = 1;

    //   jest
    //     .spyOn(fs, 'mkdir')
    //     .mockImplementation(() => {
    //       throw new Error('Directory Test Error');
    //     });

    //   jest
    //     .spyOn(fs, 'writeFile')
    //     .mockResolvedValue(undefined);

    //   const result = await s3Service.createFile(
    //     markdownFileDTO,
    //   );

    //   expect(result).toBeUndefined();
    // });

    // it("should return undefined when file can't be written to", async () => {
    //   const markdownFileDTO =
    //     new MarkdownFileDTO();
    //   markdownFileDTO.MarkdownID = 'mock_id';
    //   markdownFileDTO.Path = 'mock_path';
    //   markdownFileDTO.UserID = 1;

    //   jest
    //     .spyOn(fs, 'mkdir')
    //     .mockResolvedValue('sucess');

    //   jest
    //     .spyOn(fs, 'writeFile')
    //     .mockImplementation(() => {
    //       throw new Error(
    //         'Write File Test Error',
    //       );
    //     });

    //   const result = await s3Service.createFile(
    //     markdownFileDTO,
    //   );

    //   expect(result).toBeUndefined();
    // });
  });

  describe('createAsset', () => {
    // it('should return undefined if the s3 send fails', async () => {
    //   const assetDTO = new AssetDTO();
    //   assetDTO.UserID = 1;

    //   jest
    //     .spyOn(mockS3Client, 'send')
    //     .mockImplementation(() => {
    //       throw new Error('S3 Test Error');
    //     });

    //   const result = await s3Service.createAsset(
    //     assetDTO,
    //   );

    //   expect(result).toBeUndefined();
    // });

    it('should create asset', () => {
      const asset = new AssetDTO();
      asset.UserID = 1;

      const result = s3Service.createAsset(asset);

      expect(result).toBeDefined();
    });
  });

  describe('saveFile', () => {
    it('should save file', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = 'mock_id';
      markdownFileDTO.Path = 'mock_path';
      markdownFileDTO.UserID = 1;
      markdownFileDTO.Content = '';

      jest
        .spyOn(fs, 'access')
        .mockResolvedValue(undefined);

      jest
        .spyOn(fs, 'writeFile')
        .mockResolvedValue(undefined);

      const result = await s3Service.saveFile(
        markdownFileDTO,
      );

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(
        MarkdownFileDTO,
      );
      expect(result).toEqual(markdownFileDTO);
    });

    it('should save file with empty path', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = 'mock_id';
      markdownFileDTO.Path = '';
      markdownFileDTO.UserID = 1;
      markdownFileDTO.Content = '';

      jest
        .spyOn(fs, 'access')
        .mockResolvedValue(undefined);

      jest
        .spyOn(fs, 'writeFile')
        .mockResolvedValue(undefined);

      const result = await s3Service.saveFile(
        markdownFileDTO,
      );

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(
        MarkdownFileDTO,
      );
      expect(result).toEqual(markdownFileDTO);
    });

    // it('should return undefined when no file exists', async () => {
    //   const markdownFileDTO =
    //     new MarkdownFileDTO();
    //   markdownFileDTO.MarkdownID = 'mock_id';
    //   markdownFileDTO.Path = 'mock_path';
    //   markdownFileDTO.UserID = 1;
    //   markdownFileDTO.Content = '';

    //   jest
    //     .spyOn(fs, 'access')
    //     .mockImplementation(() => {
    //       throw new Error('Directory Test Error');
    //     });

    //   jest
    //     .spyOn(fs, 'writeFile')
    //     .mockResolvedValue(undefined);

    //   const result = await s3Service.saveFile(
    //     markdownFileDTO,
    //   );

    //   expect(result).toBeUndefined();
    // });

    // it("should return undefined when file can't be written to", async () => {
    //   const markdownFileDTO =
    //     new MarkdownFileDTO();
    //   markdownFileDTO.MarkdownID = 'mock_id';
    //   markdownFileDTO.Path = 'mock_path';
    //   markdownFileDTO.UserID = 1;
    //   markdownFileDTO.Content = '';

    //   jest
    //     .spyOn(fs, 'access')
    //     .mockResolvedValue(undefined);

    //   jest
    //     .spyOn(fs, 'writeFile')
    //     .mockImplementation(() => {
    //       throw new Error('Directory Test Error');
    //     });

    //   const result = await s3Service.saveFile(
    //     markdownFileDTO,
    //   );

    //   expect(result).toBeUndefined();
    // });
  });

  describe('saveTextAssetImage', () => {
    // it('should throw error if mkdir not possible', async () => {
    //   const assetDTO = new AssetDTO();
    //   assetDTO.UserID = 1;

    //   jest
    //     .spyOn(fs, 'mkdir')
    //     .mockImplementation(() => {
    //       throw new Error('Directory Test Error');
    //     });

    //   const response =
    //     await s3Service.saveTextAssetImage(
    //       assetDTO,
    //     );

    //   expect(response).toBeUndefined();
    // });

    // it('should throw error if mkdir not possible', async () => {
    //   const assetDTO = new AssetDTO();
    //   assetDTO.UserID = 1;
    //   assetDTO.Content = 'hello world';

    //   jest
    //     .spyOn(fs, 'mkdir')
    //     .mockResolvedValue('hello');

    //   jest
    //     .spyOn(fs, 'writeFile')
    //     .mockImplementation(() => {
    //       throw new Error('Directory Test Error');
    //     });

    //   const response =
    //     await s3Service.saveTextAssetImage(
    //       assetDTO,
    //     );

    //   expect(response).toBeUndefined();
    // });

    it('should return saved asset', async () => {
      const assetDTO = new AssetDTO();
      assetDTO.UserID = 1;
      assetDTO.Content = 'hello world';

      jest
        .spyOn(fs, 'mkdir')
        .mockResolvedValue('hello');

      jest
        .spyOn(fs, 'writeFile')
        .mockResolvedValue(undefined);

      const response =
        await s3Service.saveTextAssetImage(
          assetDTO,
        );

      expect(response).toBeDefined();
    });
  });

  describe('retrieveFile', () => {
    it('should retrieve file', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = 'mock_id';
      markdownFileDTO.Path = 'mock_path';
      markdownFileDTO.UserID = 1;

      jest
        .spyOn(fs, 'access')
        .mockResolvedValue(undefined);

      jest
        .spyOn(fs, 'readFile')
        .mockResolvedValue('hello world');

      jest
        .spyOn(mockS3Client, 'send')
        .mockResolvedValue(
          new GetObjectCommand({
            Bucket: '',
            Key: '',
          }) as never,
        );

      const result = await s3Service.retrieveFile(
        markdownFileDTO,
      );

      console.log(result);
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(
        MarkdownFileDTO,
      );
      expect(result).toEqual(markdownFileDTO);
    });

    it('should retrieve file with empty path', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = 'mock_id';
      markdownFileDTO.Path = '';
      markdownFileDTO.UserID = 1;

      jest
        .spyOn(fs, 'access')
        .mockResolvedValue(undefined);

      jest
        .spyOn(fs, 'readFile')
        .mockResolvedValue('hello world');

      jest
        .spyOn(mockS3Client, 'send')
        .mockResolvedValue(
          new GetObjectCommand({
            Bucket: '',
            Key: '',
          }) as never,
        );

      const result = await s3Service.retrieveFile(
        markdownFileDTO,
      );

      console.log(result);
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(
        MarkdownFileDTO,
      );
      expect(result).toEqual(markdownFileDTO);
    });

    // it('should return undefined when file does not exist', async () => {
    //   const markdownFileDTO =
    //     new MarkdownFileDTO();
    //   markdownFileDTO.MarkdownID = 'mock_id';
    //   markdownFileDTO.Path = 'mock_path';
    //   markdownFileDTO.UserID = 1;

    //   jest
    //     .spyOn(fs, 'access')
    //     .mockImplementation(() => {
    //       throw new Error('Directory Test Error');
    //     });

    //   jest
    //     .spyOn(fs, 'readFile')
    //     .mockResolvedValue('hello world');

    //   jest
    //     .spyOn(mockS3Client, 'send')
    //     .mockResolvedValue(
    //       new GetObjectCommand({
    //         Bucket: '',
    //         Key: '',
    //       }) as never,
    //     );

    //   const result = await s3Service.retrieveFile(
    //     markdownFileDTO,
    //   );

    //   console.log(result);
    //   expect(result).toBeUndefined();
    // });

    // it('should return undefined when readFile fails', async () => {
    //   const markdownFileDTO =
    //     new MarkdownFileDTO();
    //   markdownFileDTO.MarkdownID = 'mock_id';
    //   markdownFileDTO.Path = 'mock_path';
    //   markdownFileDTO.UserID = 1;

    //   jest
    //     .spyOn(fs, 'access')
    //     .mockResolvedValue(undefined);

    //   jest
    //     .spyOn(fs, 'readFile')
    //     .mockImplementation(() => {
    //       throw new Error('Directory Test Error');
    //     });

    //   jest
    //     .spyOn(mockS3Client, 'send')
    //     .mockResolvedValue(
    //       new GetObjectCommand({
    //         Bucket: '',
    //         Key: '',
    //       }) as never,
    //     );

    //   const result = await s3Service.retrieveFile(
    //     markdownFileDTO,
    //   );

    //   console.log(result);
    //   expect(result).toBeUndefined();
    // });
  });

  describe('retrieveAssetByID', () => {
    it('should return asset', async () => {
      const assetDTO = new AssetDTO();
      assetDTO.AssetID = '1';
      assetDTO.UserID = 1;

      // Spy on fs/promises readFile to throw error
      jest
        .spyOn(fs, 'access')
        .mockResolvedValue(undefined);
      jest
        .spyOn(fs, 'readFile')
        .mockResolvedValue('abc123');

      const responseBody =
        await s3Service.retrieveAssetByID(
          assetDTO.AssetID,
          assetDTO.UserID,
          'textractResponse',
        );

      console.log('responseBody', responseBody);
      expect(responseBody).toBeDefined();
      expect(responseBody).toBe('hello world');
    });

    it('should throw error if readFile fails', async () => {
      const assetDTO = new AssetDTO();
      assetDTO.AssetID = '1';
      assetDTO.UserID = 1;

      // mockS3Client
      //   .on(GetObjectCommand)
      //   .rejects(
      //     new Error('GetObjectCommand Error'),
      //   );

      mockS3Client.on(GetObjectCommand).rejects();

      // Spy on fs/promises readFile to throw error
      jest
        .spyOn(fs, 'access')
        .mockResolvedValue(undefined);
      jest
        .spyOn(fs, 'readFile')
        .mockImplementation(() => {
          throw new Error('Directory Test Error');
        });

      const responseBody =
        await s3Service.retrieveAssetByID(
          assetDTO.AssetID,
          assetDTO.UserID,
          'textractResponse',
        );

      console.log('responseBody', responseBody);
      expect(responseBody).toBeUndefined();
    });
  });

  describe('retrieveAsset', () => {
    // it('should throw error if access not possible', async () => {
    //   const assetDTO = new AssetDTO();
    //   assetDTO.AssetID = 'mock_id';

    //   jest
    //     .spyOn(fs, 'access')
    //     .mockImplementation(() => {
    //       throw new Error('Directory Test Error');
    //     });

    //   const response =
    //     await s3Service.retrieveAsset(assetDTO);

    //   expect(response).toBeUndefined();
    // });

    // it('should throw error if readFile not possible', async () => {
    //   const assetDTO = new AssetDTO();
    //   assetDTO.AssetID = 'mock_id';

    //   jest
    //     .spyOn(fs, 'access')
    //     .mockResolvedValue(undefined);

    //   jest
    //     .spyOn(fs, 'readFile')
    //     .mockImplementation(() => {
    //       throw new Error('Directory Test Error');
    //     });

    //   const response =
    //     await s3Service.retrieveAsset(assetDTO);

    //   expect(response).toBeUndefined();
    // });

    // it('should throw error if readFile not possible', async () => {
    //   const assetDTO = new AssetDTO();
    //   assetDTO.AssetID = 'mock_id';

    //   jest
    //     .spyOn(fs, 'access')
    //     .mockResolvedValue(undefined);

    //   jest
    //     .spyOn(fs, 'readFile')
    //     .mockImplementation(() => {
    //       throw new Error('Directory Test Error');
    //     });

    //   const response =
    //     await s3Service.retrieveAsset(assetDTO);

    //   expect(response).toBeUndefined();
    // });

    it('should return assest', async () => {
      const assetDTO = new AssetDTO();
      assetDTO.AssetID = '1';
      assetDTO.UserID = 1;

      // Spy on fs/promises readFile to throw error
      jest
        .spyOn(fs, 'access')
        .mockResolvedValue(undefined);
      jest
        .spyOn(fs, 'readFile')
        .mockResolvedValue('abc123');

      console.log(
        '-----before retrieveAsset()-----',
      );
      const result =
        await s3Service.retrieveAsset(assetDTO);

      console.log('result', result);
      expect(result).toBeDefined();
      expect(result.Content).toBe('hello world');
      expect(result.Size).toBe(
        'hello world'.length,
      );

      console.log(
        '-----after retrieveAsset()-----',
      );
    });

    describe('deleteAsset', () => {
      // it('should throw error if access not possible', async () => {
      //   const assetDTO = new AssetDTO();
      //   assetDTO.AssetID = 'mock_id';

      //   jest
      //     .spyOn(fs, 'access')
      //     .mockImplementation(() => {
      //       throw new Error(
      //         'Directory Test Error',
      //       );
      //     });

      //   const response =
      //     await s3Service.deleteAsset(assetDTO);

      //   expect(response).toBeUndefined();
      // });

      // it('should throw error if unlink not possible', async () => {
      //   const assetDTO = new AssetDTO();
      //   assetDTO.AssetID = 'mock_id';

      //   jest
      //     .spyOn(fs, 'access')
      //     .mockResolvedValue(undefined);

      //   jest
      //     .spyOn(fs, 'unlink')
      //     .mockImplementation(() => {
      //       throw new Error(
      //         'Directory Test Error',
      //       );
      //     });

      //   const response =
      //     await s3Service.deleteAsset(assetDTO);

      //   expect(response).toBeUndefined();
      // });

      it('should delete asset', async () => {
        const assetDTO = new AssetDTO();
        assetDTO.AssetID = 'mock_id';

        jest
          .spyOn(fs, 'access')
          .mockResolvedValue(undefined);

        jest
          .spyOn(fs, 'unlink')
          .mockResolvedValue(undefined);

        const response =
          await s3Service.deleteAsset(assetDTO);

        expect(response).toBeDefined();
      });
    });
  });

  describe('saveImageAsset', () => {
    // it('should return undefined if it cannot create a directory', async () => {
    //   const assetDTO = new AssetDTO();
    //   assetDTO.AssetID = 'mock_id';
    //   assetDTO.UserID = 1;

    //   jest
    //     .spyOn(fs, 'mkdir')
    //     .mockImplementation(() => {
    //       throw new Error('Directory Test Error');
    //     });

    //   const response =
    //     await s3Service.saveImageAsset(assetDTO);

    //   expect(response).toBeUndefined();
    //   expect(fs.mkdir).toBeCalledWith(
    //     './storage/1',
    //     {
    //       recursive: true,
    //     },
    //   );
    // });

    // it('should return undefined if the file cannot be written', async () => {
    //   const assetDTO = new AssetDTO();
    //   assetDTO.AssetID = 'mock_id';
    //   assetDTO.UserID = 1;
    //   assetDTO.Content = 'hello world';

    //   const fileData = new Uint8Array(
    //     Buffer.from(assetDTO.Content),
    //   );

    //   jest
    //     .spyOn(fs, 'mkdir')
    //     .mockResolvedValue(undefined);

    //   jest
    //     .spyOn(fs, 'writeFile')
    //     .mockImplementation(() => {
    //       throw new Error('Directory Test Error');
    //     });

    //   const response =
    //     await s3Service.saveImageAsset(assetDTO);

    //   expect(response).toBeUndefined();
    //   expect(fs.writeFile).toBeCalledWith(
    //     './storage/1/mock_id',
    //     fileData,
    //     'utf-8',
    //   );
    // });

    it('should send the file to s3', async () => {
      const assetDTO = new AssetDTO();
      assetDTO.AssetID = 'mock_id';
      assetDTO.UserID = 1;
      assetDTO.Content = 'hello world';

      const fileData = new Uint8Array(
        Buffer.from(assetDTO.Content),
      );

      jest
        .spyOn(fs, 'mkdir')
        .mockResolvedValue(undefined);

      jest
        .spyOn(fs, 'writeFile')
        .mockResolvedValue(undefined);

      jest
        .spyOn(mockS3Client, 'send')
        .mockResolvedValue(undefined);

      const response =
        await s3Service.saveImageAsset(assetDTO);

      expect(response).toBeDefined();
      // expect(mockS3Client.send).toBeCalled();

      expect(response.DateCreated).toBeDefined();
      expect(response.Size).not.toBe(0);
      expect(response.Content).toBe('');
    });
  });
});
