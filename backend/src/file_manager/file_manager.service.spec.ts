import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { FileManagerService } from './file_manager.service';
import { MarkdownFilesService } from '../markdown_files/markdown_files.service';
import { FoldersService } from '../folders/folders.service';
import { Repository } from 'typeorm';
import {
  TypeOrmModule,
  getRepositoryToken,
} from '@nestjs/typeorm';
import { MarkdownFile } from '../markdown_files/entities/markdown_file.entity';
import { testingModule } from '../test-utils/testingModule';
import { Folder } from '../folders/entities/folder.entity';
import { S3Service } from '../s3/s3.service';
import { ImportDTO } from './dto/import.dto';
import { ConversionService } from '../conversion/conversion.service';
import { FolderDTO } from '../folders/dto/folder.dto';
import {
  HttpException,
  HttpStatus,
} from '@nestjs/common';

describe('FileManagerService', () => {
  let fileManagerService: FileManagerService;
  let markdownFilesService: MarkdownFilesService;
  let foldersService: FoldersService;
  let s3Service: S3Service;
  let conversionService: ConversionService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        imports: [
          ...testingModule(),
          TypeOrmModule.forFeature([
            MarkdownFile,
            Folder,
          ]),
        ],
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
              renameFolder: jest.fn(),
              createFolder: jest.fn(),
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

    fileManagerService =
      module.get<FileManagerService>(
        'FileManagerService',
      );
    s3Service = module.get<S3Service>(S3Service);
    markdownFilesService =
      module.get<MarkdownFilesService>(
        MarkdownFilesService,
      );
    foldersService = module.get<FoldersService>(
      FoldersService,
    );
    s3Service = module.get<S3Service>(S3Service);
    conversionService =
      module.get<ConversionService>(
        ConversionService,
      );

    module.close();
  });

  describe('root/config', () => {
    it('file manager service should be defined', () => {
      expect(fileManagerService).toBeDefined();
    });
  });

  describe('create_folder', () => {
    it('should throw an error if FolderName is undefined', async () => {
      const folderDTO = new FolderDTO();

      try {
        await fileManagerService.createFolder(
          folderDTO,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'FolderName cannot be undefined',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });
  });

  describe('rename_folder', () => {
    it('should throw an error if FolderID is undefined', async () => {
      const folderDTO = new FolderDTO();
      folderDTO.FolderName = 'test';
      folderDTO.DateCreated = new Date();
      folderDTO.LastModified = new Date();
      folderDTO.ParentFolderID = '123';
      folderDTO.UserID = 123;
      folderDTO.Path = 'test/example';

      try {
        await fileManagerService.renameFolder(
          folderDTO,
        );
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

    it('should throw an error if FolderName is undefined', async () => {
      const folderDTO = new FolderDTO();
      folderDTO.FolderID = '123';

      try {
        await fileManagerService.renameFolder(
          folderDTO,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'FolderName cannot be undefined',
        );
        expect(error.status).toBe(
          HttpStatus.METHOD_NOT_ALLOWED,
        );
      }
    });
  });
});
