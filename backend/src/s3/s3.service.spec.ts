import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { S3Service } from './s3.service';
import { FileDTO } from './dto/file.dto';
import {
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { sdkStreamMixin } from '@aws-sdk/util-stream-node';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import { AssetDTO } from '../assets/dto/asset.dto';
import * as fs from 'fs/promises';
import { Readable } from 'stream';
import { mockClient } from 'aws-sdk-client-mock';

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
    it('should delete file', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = 'mock_id';
      markdownFileDTO.Path = 'mock_path';
      markdownFileDTO.UserID = 1;

      jest
        .spyOn(fs, 'access')
        .mockResolvedValueOnce();

      jest
        .spyOn(fs, 'unlink')
        .mockResolvedValueOnce();

      const result = await s3Service.deleteFile(
        markdownFileDTO,
      );

      expect(result).toBeDefined();
    });
  });

  describe('createFile', () => {
    it('should create file', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = 'mock_id';
      markdownFileDTO.Path = 'mock_path';
      markdownFileDTO.UserID = 1;

      jest
        .spyOn(fs, 'mkdir')
        .mockResolvedValueOnce('success');

      jest
        .spyOn(fs, 'writeFile')
        .mockResolvedValueOnce();

      const result = await s3Service.createFile(
        markdownFileDTO,
      );

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
        .mockResolvedValueOnce();

      jest
        .spyOn(fs, 'writeFile')
        .mockResolvedValueOnce();

      const result = await s3Service.saveFile(
        markdownFileDTO,
      );

      expect(result).toBeDefined();
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
        .mockResolvedValueOnce();

      const result = await s3Service.retrieveFile(
        markdownFileDTO,
      );

      expect(result).not.toBeDefined();
    });
  });

  describe('retrieveAssetByID', () => {
    it('should return asset', async () => {
      const assetDTO = new AssetDTO();
      assetDTO.AssetID = '1';
      assetDTO.UserID = 1;

      // Spy on fs/promises readFile to throw error
      jest
        .spyOn(fs, 'access')
        .mockResolvedValueOnce();
      jest
        .spyOn(fs, 'readFile')
        .mockResolvedValueOnce('abc123');

      const result =
        await s3Service.retrieveAssetByID(
          assetDTO.AssetID,
          assetDTO.UserID,
        );

      console.log('result', result);
      expect(result).toBeDefined();
      expect(result.Content).toBe('hello world');
      expect(result.Size).toBe(
        'hello world'.length,
      );
    });
  });
});
