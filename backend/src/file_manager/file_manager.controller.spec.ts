import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { FileManagerController } from './file_manager.controller';
import { FileManagerService } from './file_manager.service';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import {
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MarkdownFilesService } from '../markdown_files/markdown_files.service';
import { FoldersService } from '../folders/folders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MarkdownFile } from '../markdown_files/entities/markdown_file.entity';
import { Repository } from 'typeorm';
import { Folder } from '../folders/entities/folder.entity';
import { S3Service } from '../s3/s3.service';
import { ConversionService } from '../conversion/conversion.service';
import { DirectoryFilesDTO } from './dto/directory_files.dto';

describe('FileManagerController', () => {
  let controller: FileManagerController;
  let fileManagerService: FileManagerService;
  let s3Service: S3Service;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [FileManagerController],
        providers: [
          FileManagerService,
          MarkdownFilesService,
          FoldersService,
          S3Service,
          ConversionService,
          {
            provide: 'FileManagerService',
            useValue: {
              createFile: jest.fn(),
              renameFile: jest.fn(),
            },
          },
          {
            provide:
              getRepositoryToken(MarkdownFile),
            useClass: Repository,
          },
          {
            provide: getRepositoryToken(Folder),
            useClass: Repository,
          },
        ],
      }).compile();

    controller =
      module.get<FileManagerController>(
        FileManagerController,
      );
    fileManagerService =
      module.get<FileManagerService>(
        FileManagerService,
      );
    s3Service = module.get<S3Service>(S3Service);
  });

  describe('create_file', () => {
    it('should throw exception if request method is not POST', async () => {
      const request = { method: 'GET' };
      const markdownFileDTO =
        new MarkdownFileDTO();

      try {
        await controller.createFile(
          markdownFileDTO,
          request as any,
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Method Not Allowed',
        );
        expect(error.status).toBe(
          HttpStatus.METHOD_NOT_ALLOWED,
        );
      }
    });

    it('should return a MarkdownFileDTO', async () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.UserID = 123;
      markdownFileDTO.Path = 'example/path';
      markdownFileDTO.Name = 'example.md';

      jest
        .spyOn(fileManagerService, 'createFile')
        .mockResolvedValue(markdownFileDTO);

      const result = await controller.createFile(
        markdownFileDTO,
        request as any,
      );

      expect(result).toBeInstanceOf(
        MarkdownFileDTO,
      );
      expect(result.UserID).toBe(
        markdownFileDTO.UserID,
      );
      expect(result.Path).toBe(
        markdownFileDTO.Path,
      );
      expect(result.Name).toBe(
        markdownFileDTO.Name,
      );
      expect(
        fileManagerService.createFile,
      ).toBeCalledWith(markdownFileDTO);
    });
  });

  describe('rename_file', () => {
    it('should throw exception if request method is not POST', async () => {
      const request = { method: 'GET' };
      const markdownFileDTO =
        new MarkdownFileDTO();

      try {
        await controller.renameFile(
          markdownFileDTO,
          request as any,
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Method Not Allowed',
        );
        expect(error.status).toBe(
          HttpStatus.METHOD_NOT_ALLOWED,
        );
      }
    });

    it('should throw an error if MarkdownID is undefined', () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.UserID = 123;
      markdownFileDTO.Path = 'example/path';
      markdownFileDTO.Name = 'example.md';
      expect(() =>
        controller.renameFile(
          markdownFileDTO,
          request as any,
        ),
      ).toThrowError(
        new HttpException(
          'Invalid request data',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an error if Path is undefined', () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.UserID = 123;
      markdownFileDTO.Name = 'example.md';
      markdownFileDTO.MarkdownID = 'abc123';
      expect(() =>
        controller.renameFile(
          markdownFileDTO,
          request as any,
        ),
      ).toThrowError(
        new HttpException(
          'Path cannot be undefined',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an error if Name is undefined', () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.UserID = 123;
      markdownFileDTO.Path = 'example/path';
      markdownFileDTO.MarkdownID = 'abc123';
      expect(() =>
        controller.renameFile(
          markdownFileDTO,
          request as any,
        ),
      ).toThrowError(
        new HttpException(
          'Invalid request data',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should return DTO of updated file', async () => {
      const request = { method: 'POST' };

      // Create DTO with new name
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID =
        'fm.controller.spec renameFile';
      markdownFileDTO.UserID = 123;
      markdownFileDTO.Path = 'example/path';
      markdownFileDTO.Name = 'writetopdf.md';

      jest
        .spyOn(controller, 'renameFile')
        .mockImplementation(
          async () => markdownFileDTO,
        );

      const result = await controller.renameFile(
        markdownFileDTO,
        request as any,
      );

      expect(result).toBeInstanceOf(
        MarkdownFileDTO,
      );
      expect(result.Name).toBe(
        markdownFileDTO.Name,
      );
    });
  });

  describe('delete_file', () => {
    it('should throw exception if request method is not POST', async () => {
      const request = { method: 'GET' };
      const markdownFileDTO =
        new MarkdownFileDTO();

      try {
        await controller.deleteFile(
          markdownFileDTO,
          request as any,
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Method Not Allowed',
        );
        expect(error.status).toBe(
          HttpStatus.METHOD_NOT_ALLOWED,
        );
      }
    });

    it('should throw an error if MarkdownID is undefined', async () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.UserID = 123;
      markdownFileDTO.Path = 'example/path';
      try {
        await controller.deleteFile(
          markdownFileDTO,
          request as any,
        );
        // expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Invalid request data',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });
  });

  describe('move_file', () => {
    it('should throw exception if request method is not POST', async () => {
      const request = { method: 'GET' };
      const markdownFileDTO =
        new MarkdownFileDTO();

      try {
        await controller.moveFile(
          markdownFileDTO,
          request as any,
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Method Not Allowed',
        );
        expect(error.status).toBe(
          HttpStatus.METHOD_NOT_ALLOWED,
        );
      }
    });

    it('should throw an error if MarkdownID is undefined', async () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.UserID = 123;
      markdownFileDTO.Path = 'example/path';
      try {
        await controller.moveFile(
          markdownFileDTO,
          request as any,
        );
        // expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Invalid request data',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should throw an error if Path is undefined', async () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.UserID = 123;
      markdownFileDTO.MarkdownID = 'abc123';
      try {
        await controller.moveFile(
          markdownFileDTO,
          request as any,
        );
        // expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Invalid request data',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });
  });

  describe('retrieve_file', () => {
    it('should throw exception if request method is not POST', async () => {
      const request = { method: 'GET' };
      const markdownFileDTO =
        new MarkdownFileDTO();

      try {
        await controller.retrieveFile(
          markdownFileDTO,
          request as any,
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Method Not Allowed',
        );
        expect(error.status).toBe(
          HttpStatus.METHOD_NOT_ALLOWED,
        );
      }
    });

    it('s3service should successfully retrieve the file', async () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();

      markdownFileDTO.UserID = 123;
      markdownFileDTO.MarkdownID = 'abc123';
      markdownFileDTO.Path = 'example/path';
      markdownFileDTO.Name = 'writetopdf.md';

      jest
        .spyOn(s3Service, 'retrieveFile')
        .mockImplementation(
          async () => markdownFileDTO,
        );

      const result =
        await controller.retrieveFile(
          markdownFileDTO,
          request as any,
        );

      expect(result).toEqual(markdownFileDTO);
      expect(
        s3Service.retrieveFile,
      ).toHaveBeenCalledWith(markdownFileDTO);
    });

    it('should throw BadRequest exception if MarkdownID is undefined', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.UserID = 0;
      const request = { method: 'POST' };

      try {
        await controller.retrieveFile(
          markdownFileDTO,
          request as any,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Invalid request data',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });
  });

  describe('save_file', () => {
    it('should throw an error if MarkdownID is undefined', async () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.UserID = 123;
      markdownFileDTO.Path = 'example/path';
      try {
        await controller.save(
          markdownFileDTO,
          request as any,
        );
        // expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Invalid request data',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });
  });

  describe('retrieve_all_files', () => {
    it('should throw exception if request method is not POST', async () => {
      const request = { method: 'GET' };
      const directoryFilesDTO =
        new DirectoryFilesDTO();
      try {
        await controller.retrieveAllFiles(
          directoryFilesDTO,
          request as any,
        );
        // expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Method Not Allowed',
        );
        expect(error.status).toBe(
          HttpStatus.METHOD_NOT_ALLOWED,
        );
      }
    });

    it('should throw an error UserID is undefined', async () => {
      const request = { method: 'POST' };
      const directoryFilesDTO =
        new DirectoryFilesDTO();
      try {
        await controller.retrieveAllFiles(
          directoryFilesDTO,
          request as any,
        );
        // expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Invalid request data',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });
  });
});
