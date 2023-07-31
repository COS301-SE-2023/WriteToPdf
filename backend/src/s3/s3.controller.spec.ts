import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { S3Controller } from './s3.controller';
import { S3Service } from './s3.service';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';

describe('S3Controller', () => {
  let controller: S3Controller;
  let s3Service: S3Service;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [S3Controller],
        providers: [S3Service],
      }).compile();

    controller =
      module.get<S3Controller>(S3Controller);
    s3Service = module.get<S3Service>(S3Service);
  });

  describe('create_file', () => {
    it('should call the s3Service.createFile method', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();

      jest
        .spyOn(s3Service, 'createFile')
        .mockResolvedValue(markdownFileDTO);

      const result = await controller.createFile(
        markdownFileDTO,
      );

      expect(
        s3Service.createFile,
      ).toHaveBeenCalledWith(markdownFileDTO);
      expect(result).toEqual(markdownFileDTO);
    });
  });

  describe('delete_file', () => {
    it('should call the s3Service.deleteFile method', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();

      jest
        .spyOn(s3Service, 'deleteFile')
        .mockResolvedValue(markdownFileDTO);

      const result = await controller.deleteFile(
        markdownFileDTO,
      );

      expect(
        s3Service.deleteFile,
      ).toHaveBeenCalledWith(markdownFileDTO);
      expect(result).toEqual(markdownFileDTO);
    });
  });

  describe('save_file', () => {
    it('should call the s3Service.saveFile method', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();

      jest
        .spyOn(s3Service, 'saveFile')
        .mockResolvedValue(markdownFileDTO);

      const result = await controller.saveFile(
        markdownFileDTO,
      );

      expect(
        s3Service.saveFile,
      ).toHaveBeenCalledWith(markdownFileDTO);
      expect(result).toEqual(markdownFileDTO);
    });
  });

  describe('retrieve_file', () => {
    it('should call the s3Service.retrieveFile method', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();

      jest
        .spyOn(s3Service, 'retrieveFile')
        .mockResolvedValue(markdownFileDTO);

      const result =
        await controller.retrieveFile(
          markdownFileDTO,
        );

      expect(
        s3Service.retrieveFile,
      ).toHaveBeenCalledWith(markdownFileDTO);
      expect(result).toEqual(markdownFileDTO);
    });
  });
});
