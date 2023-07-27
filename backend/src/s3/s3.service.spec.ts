import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { S3Service } from './s3.service';
import { FileDTO } from './dto/file.dto';
import { S3Client } from '@aws-sdk/client-s3';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import { AssetDTO } from '../assets/dto/asset.dto';
import * as fs from 'fs/promises';
import { buffer } from 'stream/consumers';

jest.mock('@aws-sdk/client-s3');
// jest.mock('fs/promises');

describe('S3Service', () => {
  let s3Service: S3Service;
  // let mockS3Client: jest.Mocked<S3Client>;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [S3Service],
      }).compile();

    s3Service = module.get<S3Service>(S3Service);
    // mockS3Client =
    //   S3Client as unknown as jest.Mocked<S3Client>;
    // mockS3Client.send = jest.fn();
    // s3Service.s3Client = mockS3Client;
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

  // describe('deleteFile', () => {
  //   it('should delete file', async () => {
  //     const markdownFileDTO =
  //       new MarkdownFileDTO();
  //     markdownFileDTO.MarkdownID = 'mock_id';
  //     markdownFileDTO.Path = 'mock_path';
  //     markdownFileDTO.UserID = 1;

  //     const result = await s3Service.deleteFile(
  //       markdownFileDTO,
  //     );

  //     expect(result).toBeDefined();
  //   });
  // });

  // describe('createFile', () => {
  //   it('should create file', async () => {
  //     const markdownFileDTO =
  //       new MarkdownFileDTO();
  //     markdownFileDTO.MarkdownID = 'mock_id';
  //     markdownFileDTO.Path = 'mock_path';
  //     markdownFileDTO.UserID = 1;

  //     const result = await s3Service.createFile(
  //       markdownFileDTO,
  //     );

  //     expect(result).toBeDefined();
  //   });
  // });

  // describe('saveFile', () => {
  //   it('should save file', async () => {
  //     const markdownFileDTO =
  //       new MarkdownFileDTO();
  //     markdownFileDTO.MarkdownID = 'mock_id';
  //     markdownFileDTO.Path = 'mock_path';
  //     markdownFileDTO.UserID = 1;
  //     markdownFileDTO.Content = '';

  //     const result = await s3Service.saveFile(
  //       markdownFileDTO,
  //     );

  //     expect(result).toBeDefined();
  //   });
  // });

  // describe('retrieveFile', () => {
  //   it('should retrieve file', async () => {
  //     const markdownFileDTO =
  //       new MarkdownFileDTO();
  //     markdownFileDTO.MarkdownID = 'mock_id';
  //     markdownFileDTO.Path = 'mock_path';
  //     markdownFileDTO.UserID = 1;

  //     const result = await s3Service.retrieveFile(
  //       markdownFileDTO,
  //     );

  //     expect(result).not.toBeDefined();
  //   });
  // });

  describe('saveAsset', () => {
    it('should return undefined if directory cannot be created', async () => {
      const assetDTO = new AssetDTO();
      assetDTO.UserID = 1;

      // Spy on fs/promises mkdir to throw error
      jest
        .spyOn(fs, 'mkdir')
        .mockImplementationOnce(() => {
          throw new Error();
        });

      const result = await s3Service.saveAsset(
        assetDTO,
      );

      expect(result).toBeUndefined();
    });

    it('should return undefined if file cannot be created', async () => {
      const assetDTO = new AssetDTO();
      assetDTO.UserID = 1;

      // Spy on fs/promises mkdir to return success
      jest
        .spyOn(fs, 'mkdir')
        .mockResolvedValue('success');

      // Spy on Uint8Array to return success
      // jest
      //   .spyOn(Uint8Array.prototype, 'slice')
      //   .mockImplementation(() => {
      //     return new Uint8Array();
      //   });

      // Spy on Buffer from to return success
      jest
        .spyOn(Buffer, 'from')
        .mockImplementation((buffer) => {
          return buffer as any;
        });

      // Spy on fs/promises writeFile to throw error
      jest
        .spyOn(fs, 'writeFile')
        .mockImplementationOnce(() => {
          throw new Error();
        });

      const result = await s3Service.saveAsset(
        assetDTO,
      );

      expect(result).toBeUndefined();
    });
  });
});
