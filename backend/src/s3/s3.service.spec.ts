import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { S3Service } from './s3.service';
import { S3Client } from '@aws-sdk/client-s3';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';

jest.mock('@aws-sdk/client-s3');
jest.mock('fs/promises');

describe('S3Service', () => {
  let s3Service: S3Service;
  let mockS3Client: jest.Mocked<S3Client>;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [S3Service],
      }).compile();

    s3Service = module.get<S3Service>(S3Service);
    mockS3Client =
      S3Client as unknown as jest.Mocked<S3Client>;
    mockS3Client.send = jest.fn();
    // s3Service.s3Client = mockS3Client;
  });

  describe('S3Service.deleteFile', () => {
    it('should delete file', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = 'mock_id';
      markdownFileDTO.Path = 'mock_path';
      markdownFileDTO.UserID = 1;

      const result = await s3Service.deleteFile(
        markdownFileDTO,
      );

      expect(result).toBeDefined();
    });
  });

  describe('S3Service.createFile', () => {
    it('should create file', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = 'mock_id';
      markdownFileDTO.Path = 'mock_path';
      markdownFileDTO.UserID = 1;

      const result = await s3Service.createFile(
        markdownFileDTO,
      );

      expect(result).toBeDefined();
    });
  });

  describe('S3Service.saveFile', () => {
    it('should save file', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = 'mock_id';
      markdownFileDTO.Path = 'mock_path';
      markdownFileDTO.UserID = 1;
      markdownFileDTO.Content = '';

      const result = await s3Service.saveFile(
        markdownFileDTO,
      );

      expect(result).toBeDefined();
    });
  });

  describe('S3Service.retrieveFile', () => {
    it('should retrieve file', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = 'mock_id';
      markdownFileDTO.Path = 'mock_path';
      markdownFileDTO.UserID = 1;

      const result = await s3Service.retrieveFile(
        markdownFileDTO,
      );

      expect(result).not.toBeDefined();
    });
  });
});
