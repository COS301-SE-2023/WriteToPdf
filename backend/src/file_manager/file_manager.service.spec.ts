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
import { DirectoryFoldersDTO } from './dto/directory_folders.dto';
import {
  HttpException,
  HttpStatus,
} from '@nestjs/common';

describe('FileManagerService', () => {
  let service: FileManagerService;
  let foldersService: FoldersService;
  let markdownFilesService: MarkdownFilesService;
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
          FoldersService,
          MarkdownFilesService,
          S3Service,
          ConversionService,
          {
            provide: 'FileManagerService',
            useValue: {
              createFile: jest.fn(),
              renameFile: jest.fn(),
              renameFolder: jest.fn(),
              createFolder: jest.fn(),
              retrieveAllFolders: jest.fn(),
              convertFoldersToDTOs: jest.fn(),
            },
          },
          {
            provide: 'FoldersService',
            useValue: {
              create: jest.fn(),
              findAllByUserID: jest.fn(),
              updateName: jest.fn(),
              updatePath: jest.fn(),
              remove: jest.fn(),
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

    service = module.get<FileManagerService>(
      FileManagerService,
    );
    foldersService = module.get<FoldersService>(
      FoldersService,
    );
    s3Service = module.get<S3Service>(S3Service);
    markdownFilesService =
      module.get<MarkdownFilesService>(
        MarkdownFilesService,
      );
    s3Service = module.get<S3Service>(S3Service);
    conversionService =
      module.get<ConversionService>(
        ConversionService,
      );

    module.close();
  });

  describe('create_folder', () => {
    it('should throw an error if FolderName is undefined', async () => {
      const folderDTO = new FolderDTO();
      folderDTO.UserID = 0;
      folderDTO.ParentFolderID = '123';
      folderDTO.Path = 'test/example';

      try {
        const response =
          await service.createFolder(folderDTO);
        console.log(response);
        expect(true).toBe(false);
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

    it('should throw an error if UserID is undefined', async () => {
      const folderDTO = new FolderDTO();
      folderDTO.FolderName = 'test';
      folderDTO.ParentFolderID = '123';
      folderDTO.Path = 'test/example';

      try {
        const response =
          await service.createFolder(folderDTO);
        console.log(response);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'UserID cannot be undefined',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should throw an error if ParentFolderID is undefined', async () => {
      const folderDTO = new FolderDTO();
      folderDTO.FolderName = 'test';
      folderDTO.UserID = 0;
      folderDTO.Path = 'test/example';

      try {
        const response =
          await service.createFolder(folderDTO);
        console.log(response);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'ParentFolderID cannot be undefined',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should throw an error if Path is undefined', async () => {
      const folderDTO = new FolderDTO();
      folderDTO.FolderName = 'test';
      folderDTO.UserID = 0;
      folderDTO.ParentFolderID = '123';

      try {
        const response =
          await service.createFolder(folderDTO);
        console.log(response);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Path cannot be undefined',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should throw an error if FolderName is empty', async () => {
      const folderDTO = new FolderDTO();
      folderDTO.FolderName = '';
      folderDTO.UserID = 0;
      folderDTO.ParentFolderID = '123';
      folderDTO.Path = 'test/example';

      try {
        const response =
          await service.createFolder(folderDTO);
        console.log(response);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'FolderName cannot be empty',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should call createFolder method', async () => {
      const folderDTO = new FolderDTO();
      folderDTO.FolderName = 'test';
      folderDTO.UserID = 0;
      folderDTO.ParentFolderID = '123';
      folderDTO.Path = 'test/example';

      jest
        .spyOn(foldersService, 'create')
        .mockResolvedValue(new FolderDTO());

      const response = await service.createFolder(
        folderDTO,
      );
      expect(response).toBeInstanceOf(FolderDTO);
      expect(
        foldersService.create,
      ).toHaveBeenCalledWith(folderDTO);
    });
  });

  describe('retrieveAllFolders', () => {
    it('should throw an error if UserID is undefined', async () => {
      const directory_foldersDTO =
        new DirectoryFoldersDTO();
      directory_foldersDTO.Folders = [];

      try {
        const response =
          await service.retrieveAllFolders(
            directory_foldersDTO,
          );
        console.log(response);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'UserID cannot be undefined',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should call findAllByUserID method', async () => {
      const directory_foldersDTO =
        new DirectoryFoldersDTO();
      directory_foldersDTO.UserID = 0;
      directory_foldersDTO.Folders = [];

      jest
        .spyOn(foldersService, 'findAllByUserID')
        .mockResolvedValue([]);

      const response =
        await service.retrieveAllFolders(
          directory_foldersDTO,
        );
      expect(response).toBeInstanceOf(
        DirectoryFoldersDTO,
      );
      expect(
        foldersService.findAllByUserID,
      ).toHaveBeenCalledWith(
        directory_foldersDTO.UserID,
      );
    });

    it('should call convertFoldersToDTOs method', async () => {
      const directory_foldersDTO =
        new DirectoryFoldersDTO();
      directory_foldersDTO.UserID = 0;
      directory_foldersDTO.Folders = [];

      jest
        .spyOn(foldersService, 'findAllByUserID')
        .mockResolvedValue([]);

      (
        jest.spyOn(
          service,
          'convertFoldersToDTOs',
        ) as any
      ).mockResolvedValue([]);

      const response =
        await service.retrieveAllFolders(
          directory_foldersDTO,
        );
      expect(response).toBeInstanceOf(
        DirectoryFoldersDTO,
      );
      expect(
        service.convertFoldersToDTOs,
      ).toHaveBeenCalledWith([]);
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
        await service.renameFolder(folderDTO);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'FolderID cannot be undefined',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should throw an error if FolderName is undefined', async () => {
      const folderDTO = new FolderDTO();
      folderDTO.FolderID = '123';

      try {
        await service.renameFolder(folderDTO);
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

    it('should call updateName method', async () => {
      const folderDTO = new FolderDTO();
      folderDTO.FolderID = '123';
      folderDTO.FolderName = 'test';

      jest
        .spyOn(foldersService, 'updateName')
        .mockResolvedValue(new FolderDTO());

      const response = await service.renameFolder(
        folderDTO,
      );
      expect(response).toBeInstanceOf(FolderDTO);
      expect(
        foldersService.updateName,
      ).toHaveBeenCalledWith(folderDTO);
    });
  });

  describe('convertFoldersToDTOs', () => {
    it('should convert folders to DTOs', () => {
      const folders: Folder[] = [
        {
          FolderID: '1',
          UserID: 1,
          DateCreated: new Date(),
          LastModified: new Date(),
          FolderName: 'Test Folder',
          Path: 'test/example',
          ParentFolderID: '123',
        },
      ];

      const expectedDTOs: FolderDTO[] = [
        {
          FolderID: '1',
          UserID: 1,
          DateCreated: expect.any(Date),
          LastModified: expect.any(Date),
          FolderName: 'Test Folder',
          Path: 'test/example',
          ParentFolderID: '123',
        },
      ];

      const convertedDTOs =
        service.convertFoldersToDTOs(folders);
      expect(convertedDTOs).toEqual(expectedDTOs);
    });
  });

  describe('moveFolder', () => {
    it('should throw an error if FolderID is undefined', async () => {
      const folderDTO = new FolderDTO();
      folderDTO.ParentFolderID = '123';
      folderDTO.Path = 'test/example';

      try {
        await service.moveFolder(folderDTO);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'FolderID cannot be undefined',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should throw an error if ParentFolderID is undefined', async () => {
      const folderDTO = new FolderDTO();
      folderDTO.FolderID = '1';
      folderDTO.Path = 'test/example';

      try {
        await service.moveFolder(folderDTO);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'ParentFolderID cannot be undefined',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should throw an error if Path is undefined', async () => {
      const folderDTO = new FolderDTO();
      folderDTO.FolderID = '1';
      folderDTO.ParentFolderID = '123';

      try {
        await service.moveFolder(folderDTO);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Path cannot be undefined',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should call updatePath method', async () => {
      const folderDTO = new FolderDTO();
      folderDTO.FolderID = '1';
      folderDTO.ParentFolderID = '123';
      folderDTO.Path = 'test/example';

      jest
        .spyOn(foldersService, 'updatePath')
        .mockResolvedValue(new FolderDTO());

      const response = await service.moveFolder(
        folderDTO,
      );
      expect(response).toBeInstanceOf(FolderDTO);
      expect(
        foldersService.updatePath,
      ).toHaveBeenCalledWith(folderDTO);
    });
  });

  describe('deleteFolder', () => {
    it('should throw an error if FolderID is undefined', async () => {
      const folderDTO = new FolderDTO();

      try {
        await service.deleteFolder(folderDTO);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'FolderID cannot be undefined',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should call remove method', async () => {
      const folderDTO = new FolderDTO();
      folderDTO.FolderID = '1';

      jest
        .spyOn(foldersService, 'remove')
        .mockResolvedValue(new FolderDTO());

      const response = await service.deleteFolder(
        folderDTO,
      );
      expect(response).toBeInstanceOf(FolderDTO);
      expect(
        foldersService.remove,
      ).toHaveBeenCalledWith(folderDTO);
    });
  });
});
