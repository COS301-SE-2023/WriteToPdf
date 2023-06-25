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

describe('FileManagerController', () => {
  let controller: FileManagerController;
  let fileManagerService: FileManagerService;

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
        'FileManagerService',
      );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
  });
});
