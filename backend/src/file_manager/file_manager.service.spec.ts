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
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import { DirectoryFoldersDTO } from './dto/directory_folders.dto';
import {
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DirectoryFilesDTO } from './dto/directory_files.dto';
import { ExportDTO } from './dto/export.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { testDBOptions } from '../../db/data-source';
import { UserDTO } from '../users/dto/user.dto';

describe('FileManagerService', () => {
  let service: FileManagerService;
  let foldersService: FoldersService;
  let markdownFilesService: MarkdownFilesService;
  let s3Service: S3Service;
  let conversionService: ConversionService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          FileManagerService,
          FoldersService,
          MarkdownFilesService,
          S3Service,
          ConversionService,
          UsersService,
          AuthService,
          JwtService,
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
            provide: 'ConversionService',
            useValue: {
              convertFrom: jest.fn(),
              convertTo: jest.fn(),
              convertFromText: jest.fn(),
              convertToTxt: jest.fn(),
            },
          },
          {
            provide: 'UsersService',
            useValue: {
              findOne: jest.fn(),
            },
          },
          {
            provide: 'MarkdownFilesService',
            useValue: {
              create: jest.fn(),
              findAllByUserID: jest.fn(),
              updateName: jest.fn(),
              updatePath: jest.fn(),
              remove: jest.fn(),
              updateLastModified: jest.fn(),
            },
          },
          {
            provide: 'S3Service',
            useValue: {
              saveFile: jest.fn(),
              deleteFile: jest.fn(),
              createFile: jest.fn(),
              retrieveFile: jest.fn(),
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
          {
            provide: getRepositoryToken(User),
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
    markdownFilesService =
      module.get<MarkdownFilesService>(
        MarkdownFilesService,
      );
    s3Service = module.get<S3Service>(S3Service);
    conversionService =
      module.get<ConversionService>(
        ConversionService,
      );
    usersService =
      module.get<UsersService>(UsersService);
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

  describe('createFile', () => {
    it('should throw an error if UserID is undefined', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();

      try {
        await service.createFile(markdownFileDTO);
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

    it('should create a new file with default values if Path, Name, and Size are undefined', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.UserID = 0;

      const returnFile = new MarkdownFileDTO();
      returnFile.Path = '';
      returnFile.Name = 'New Document';
      returnFile.Size = 0;

      const createFileSpy = jest.spyOn(
        s3Service,
        'createFile',
      );
      createFileSpy.mockResolvedValue(
        new MarkdownFileDTO(),
      );
      const createSpy = jest.spyOn(
        markdownFilesService,
        'create',
      );
      createSpy.mockResolvedValue(
        markdownFileDTO,
      );

      const response = await service.createFile(
        markdownFileDTO,
      );

      expect(createFileSpy).toHaveBeenCalledWith(
        markdownFileDTO,
      );
      expect(createSpy).toHaveBeenCalledWith(
        markdownFileDTO,
      );
      expect(response).toBeInstanceOf(
        MarkdownFileDTO,
      );
      expect(response.Path).toBe('');
      expect(response.Name).toBe('New Document');
      expect(response.Size).toBe(0);
    });

    it('should create a new file with provided values', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.UserID = 0;
      markdownFileDTO.Path = 'test/path';
      markdownFileDTO.Name = 'test-file.md';
      markdownFileDTO.Size = 100;

      const createFileSpy = jest.spyOn(
        s3Service,
        'createFile',
      );
      createFileSpy.mockResolvedValue(
        markdownFileDTO,
      );
      createFileSpy;
      const createSpy = jest.spyOn(
        markdownFilesService,
        'create',
      );
      createSpy.mockResolvedValue(
        markdownFileDTO,
      );

      const response = await service.createFile(
        markdownFileDTO,
      );

      expect(createFileSpy).toHaveBeenCalledWith(
        markdownFileDTO,
      );
      expect(createSpy).toHaveBeenCalledWith(
        markdownFileDTO,
      );
      expect(response).toBeInstanceOf(
        MarkdownFileDTO,
      );
      expect(response.Path).toBe('test/path');
      expect(response.Name).toBe('test-file.md');
      expect(response.Size).toBe(100);
    });
  });

  describe('retrieveFile', () => {
    it('should throw an error if MarkdownID is undefined', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();

      try {
        await service.retrieveFile(
          markdownFileDTO,
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'MarkdownID cannot be undefined',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should call retrieveFile method', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = '1';

      jest
        .spyOn(s3Service, 'retrieveFile')
        .mockResolvedValue(new MarkdownFileDTO());

      const response = await service.retrieveFile(
        markdownFileDTO,
      );
      expect(response).toBeInstanceOf(
        MarkdownFileDTO,
      );
      expect(
        s3Service.retrieveFile,
      ).toHaveBeenCalledWith(markdownFileDTO);
    });
  });

  describe('convertFilesToDTOs', () => {
    it('should convert files to DTOs', () => {
      const file1: MarkdownFile = {
        MarkdownID: '1',
        UserID: 0,
        Path: 'test/path',
        Name: 'file1.md',
        LastModified: new Date(),
        DateCreated: new Date(),
        ParentFolderID: '1',
        Size: 100,
      };
      const file2: MarkdownFile = {
        MarkdownID: '2',
        UserID: 0,
        Path: 'test/path',
        Name: 'file2.md',
        LastModified: new Date(),
        DateCreated: new Date(),
        ParentFolderID: '1',
        Size: 100,
      };
      const files = [file1, file2];

      const response =
        service.convertFilesToDTOs(files);

      expect(response).toBeInstanceOf(Array);
      expect(response).toHaveLength(2);

      expect(response[0].Path).toBe(file1.Path);
      expect(response[0].Name).toBe(file1.Name);
      expect(response[0].Size).toBe(file1.Size);
      expect(response[0].Content).toBe('');
      expect(response[0].LastModified).toBe(
        file1.LastModified,
      );
      expect(response[0].DateCreated).toBe(
        file1.DateCreated,
      );
      expect(response[0].ParentFolderID).toBe(
        file1.ParentFolderID,
      );
      expect(response[0].MarkdownID).toBe(
        file1.MarkdownID,
      );

      expect(response[1].Path).toBe(file2.Path);
      expect(response[1].Name).toBe(file2.Name);
      expect(response[1].Size).toBe(file2.Size);
      expect(response[1].Content).toBe('');
      expect(response[1].LastModified).toBe(
        file2.LastModified,
      );
      expect(response[1].DateCreated).toBe(
        file2.DateCreated,
      );
      expect(response[1].ParentFolderID).toBe(
        file2.ParentFolderID,
      );
      expect(response[1].MarkdownID).toBe(
        file2.MarkdownID,
      );
    });
  });

  describe('retrieveAllFiles', () => {
    it('should throw an error if UserID is undefined', async () => {
      const directoryFilesDTO =
        new DirectoryFilesDTO();

      try {
        await service.retrieveAllFiles(
          directoryFilesDTO,
        );
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
      const directoryFilesDTO =
        new DirectoryFilesDTO();
      directoryFilesDTO.UserID = 0;

      jest
        .spyOn(
          markdownFilesService,
          'findAllByUserID',
        )
        .mockResolvedValue([]);

      const response =
        await service.retrieveAllFiles(
          directoryFilesDTO,
        );
      expect(response).toBeInstanceOf(
        DirectoryFilesDTO,
      );
      expect(
        markdownFilesService.findAllByUserID,
      ).toHaveBeenCalledWith(
        directoryFilesDTO.UserID,
      );
    });

    it('should call convertFilesToDTOs method', async () => {
      const directoryFilesDTO =
        new DirectoryFilesDTO();
      directoryFilesDTO.UserID = 0;

      const files: MarkdownFile[] = [
        {
          MarkdownID: '1',
          UserID: 0,
          Path: 'test/path',
          Name: 'file1.md',
          LastModified: new Date(),
          DateCreated: new Date(),
          ParentFolderID: '1',
          Size: 100,
        },
        {
          MarkdownID: '2',
          UserID: 0,
          Path: 'test/path',
          Name: 'file2.md',
          LastModified: new Date(),
          DateCreated: new Date(),
          ParentFolderID: '1',
          Size: 100,
        },
      ];

      jest
        .spyOn(
          markdownFilesService,
          'findAllByUserID',
        )
        .mockResolvedValue(files);

      const convertSpy = jest.spyOn(
        service,
        'convertFilesToDTOs',
      );
      convertSpy.mockReturnValue([
        new MarkdownFileDTO(),
        new MarkdownFileDTO(),
      ]);

      const response =
        await service.retrieveAllFiles(
          directoryFilesDTO,
        );
      expect(response).toBeInstanceOf(
        DirectoryFilesDTO,
      );
      expect(
        markdownFilesService.findAllByUserID,
      ).toHaveBeenCalledWith(
        directoryFilesDTO.UserID,
      );
      expect(convertSpy).toHaveBeenCalledWith(
        files,
      );
    });
  });

  describe('renameFile', () => {
    it('should throw an error if MarkdownID is undefined', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.Name = 'test';
      markdownFileDTO.Path = 'test/path';
      markdownFileDTO.UserID = 0;
      markdownFileDTO.ParentFolderID = '1';

      try {
        await service.renameFile(markdownFileDTO);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'MarkdownID cannot be undefined',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should throw an error if Name is undefined', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = '1';
      markdownFileDTO.Path = 'test/path';
      markdownFileDTO.UserID = 0;
      markdownFileDTO.ParentFolderID = '1';

      try {
        await service.renameFile(markdownFileDTO);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Name cannot be undefined',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should throw an error if Path is undefined', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = '1';
      markdownFileDTO.Name = 'test';
      markdownFileDTO.UserID = 0;
      markdownFileDTO.ParentFolderID = '1';

      try {
        await service.renameFile(markdownFileDTO);
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

    it('should throw an error if UserID is undefined', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = '1';
      markdownFileDTO.Name = 'test';
      markdownFileDTO.Path = 'test/path';
      markdownFileDTO.ParentFolderID = '1';

      try {
        await service.renameFile(markdownFileDTO);
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

    it('should call updateName method', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = '1';
      markdownFileDTO.Name = 'test';
      markdownFileDTO.Path = 'test/path';
      markdownFileDTO.UserID = 0;
      markdownFileDTO.ParentFolderID = '1';

      jest
        .spyOn(markdownFilesService, 'updateName')
        .mockResolvedValue(new MarkdownFile());

      const response = await service.renameFile(
        markdownFileDTO,
      );
      expect(response).toBeInstanceOf(
        MarkdownFile,
      );
      expect(
        markdownFilesService.updateName,
      ).toHaveBeenCalledWith(markdownFileDTO);
    });
  });

  describe('moveFile', () => {
    it('should throw an error if MarkdownID is undefined', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.Path = 'test/path';
      markdownFileDTO.UserID = 0;
      markdownFileDTO.ParentFolderID = '1';

      try {
        await service.moveFile(markdownFileDTO);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'MarkdownID cannot be undefined',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should throw an error if Path is undefined', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = '1';
      markdownFileDTO.UserID = 0;
      markdownFileDTO.ParentFolderID = '1';

      try {
        await service.moveFile(markdownFileDTO);
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

    it('should throw an error if UserID is undefined', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = '1';
      markdownFileDTO.Path = 'test/path';
      markdownFileDTO.ParentFolderID = '1';

      try {
        await service.moveFile(markdownFileDTO);
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

    it('should call updatePath method', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = '1';
      markdownFileDTO.Path = 'test/path';
      markdownFileDTO.UserID = 0;
      markdownFileDTO.ParentFolderID = '1';

      jest
        .spyOn(markdownFilesService, 'updatePath')
        .mockResolvedValue(new MarkdownFile());

      const response = await service.moveFile(
        markdownFileDTO,
      );
      expect(response).toBeInstanceOf(
        MarkdownFile,
      );
      expect(
        markdownFilesService.updatePath,
      ).toHaveBeenCalledWith(markdownFileDTO);
    });
  });

  describe('saveFile', () => {
    it('should throw an error if MarkdownID is undefined', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.Path = 'test/path';
      markdownFileDTO.UserID = 0;
      markdownFileDTO.ParentFolderID = '1';

      try {
        await service.saveFile(markdownFileDTO);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'MarkdownID cannot be undefined',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should call saveFile method', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = '1';
      markdownFileDTO.Path = 'test/path';
      markdownFileDTO.UserID = 0;
      markdownFileDTO.ParentFolderID = '1';

      jest
        .spyOn(s3Service, 'saveFile')
        .mockResolvedValue(new MarkdownFileDTO());

      jest
        .spyOn(
          markdownFilesService,
          'updateLastModified',
        )
        .mockResolvedValue(new MarkdownFile());

      const response = await service.saveFile(
        markdownFileDTO,
      );
      expect(response).toBeInstanceOf(
        MarkdownFile,
      );
      expect(
        s3Service.saveFile,
      ).toHaveBeenCalledWith(markdownFileDTO);
    });

    it('should call updateLastModified method', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = '1';
      markdownFileDTO.Path = 'test/path';
      markdownFileDTO.UserID = 0;
      markdownFileDTO.ParentFolderID = '1';

      jest
        .spyOn(s3Service, 'saveFile')
        .mockResolvedValue(new MarkdownFileDTO());

      jest
        .spyOn(
          markdownFilesService,
          'updateLastModified',
        )
        .mockResolvedValue(new MarkdownFile());

      const response = await service.saveFile(
        markdownFileDTO,
      );
      expect(response).toBeInstanceOf(
        MarkdownFile,
      );
      expect(
        markdownFilesService.updateLastModified,
      ).toHaveBeenCalledWith(markdownFileDTO);
    });
  });

  describe('deleteFile', () => {
    it('should throw an error if MarkdownID is undefined', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.Path = 'test/path';
      markdownFileDTO.UserID = 0;
      markdownFileDTO.ParentFolderID = '1';

      try {
        await service.deleteFile(markdownFileDTO);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'MarkdownID cannot be undefined',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should call deleteFile method', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = '1';
      markdownFileDTO.Path = 'test/path';
      markdownFileDTO.UserID = 0;
      markdownFileDTO.ParentFolderID = '1';

      jest
        .spyOn(s3Service, 'deleteFile')
        .mockResolvedValue(new MarkdownFileDTO());

      jest
        .spyOn(markdownFilesService, 'remove')
        .mockResolvedValue(new MarkdownFile());

      const response = await service.deleteFile(
        markdownFileDTO,
      );
      expect(response).toBeInstanceOf(
        MarkdownFile,
      );
      expect(
        s3Service.deleteFile,
      ).toHaveBeenCalledWith(markdownFileDTO);
    });

    it('should call remove method', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = '1';
      markdownFileDTO.Path = 'test/path';
      markdownFileDTO.UserID = 0;
      markdownFileDTO.ParentFolderID = '1';

      jest
        .spyOn(s3Service, 'deleteFile')
        .mockResolvedValue(new MarkdownFileDTO());

      jest
        .spyOn(markdownFilesService, 'remove')
        .mockResolvedValue(new MarkdownFile());

      const response = await service.deleteFile(
        markdownFileDTO,
      );
      expect(response).toBeInstanceOf(
        MarkdownFile,
      );
      expect(
        markdownFilesService.remove,
      ).toHaveBeenCalledWith(markdownFileDTO);
    });
  });

  describe('importFile', () => {
    it('should throw an error if Path is undefined', async () => {
      const importDTO = new ImportDTO();
      importDTO.UserID = 0;
      importDTO.ParentFolderID = '1';
      importDTO.Name = 'test';
      importDTO.Content = 'test';

      try {
        await service.importFile(importDTO);
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

    it('should throw an error if Name is undefined', async () => {
      const importDTO = new ImportDTO();
      importDTO.UserID = 0;
      importDTO.ParentFolderID = '1';
      importDTO.Path = 'test/path';
      importDTO.Content = 'test';

      try {
        await service.importFile(importDTO);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Name cannot be undefined',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should throw an error if Content is undefined', async () => {
      const importDTO = new ImportDTO();
      importDTO.UserID = 0;
      importDTO.ParentFolderID = '1';
      importDTO.Path = 'test/path';
      importDTO.Name = 'test';

      try {
        await service.importFile(importDTO);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Content cannot be undefined',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should call convertFrom method', async () => {
      const importDTO = new ImportDTO();
      importDTO.UserID = 0;
      importDTO.ParentFolderID = '1';
      importDTO.Path = 'test/path';
      importDTO.Name = 'test';
      importDTO.Content = 'test';

      (
        jest.spyOn(
          conversionService,
          'convertFrom',
        ) as any
      ).mockResolvedValue(new MarkdownFileDTO());

      jest
        .spyOn(service, 'createFile')
        .mockResolvedValue(new MarkdownFileDTO());

      jest
        .spyOn(service, 'saveFile')
        .mockResolvedValue(new MarkdownFile());

      jest
        .spyOn(usersService, 'findOne')
        .mockResolvedValue(new UserDTO());

      const response = await service.importFile(
        importDTO,
      );
      expect(response).toBeInstanceOf(
        MarkdownFileDTO,
      );
      expect(
        conversionService.convertFrom,
      ).toHaveBeenCalledWith(importDTO);
    });

    it('should call createFile method', async () => {
      const importDTO = new ImportDTO();
      importDTO.UserID = 0;
      importDTO.ParentFolderID = '1';
      importDTO.Path = 'test/path';
      importDTO.Name = 'test';
      importDTO.Content = 'test';

      (
        jest.spyOn(
          conversionService,
          'convertFrom',
        ) as any
      ).mockResolvedValue(new MarkdownFileDTO());

      jest
        .spyOn(service, 'createFile')
        .mockResolvedValue(new MarkdownFileDTO());

      jest
        .spyOn(service, 'saveFile')
        .mockResolvedValue(new MarkdownFile());

      jest
        .spyOn(usersService, 'findOne')
        .mockResolvedValue(new UserDTO());

      const response = await service.importFile(
        importDTO,
      );
      expect(response).toBeInstanceOf(
        MarkdownFileDTO,
      );
      expect(
        service.createFile,
      ).toHaveBeenCalled();
    });

    it('should call saveFile method', async () => {
      const importDTO = new ImportDTO();
      importDTO.UserID = 0;
      importDTO.ParentFolderID = '1';
      importDTO.Path = 'test/path';
      importDTO.Name = 'test';
      importDTO.Content = 'test';

      (
        jest.spyOn(
          conversionService,
          'convertFrom',
        ) as any
      ).mockResolvedValue(new MarkdownFileDTO());

      jest
        .spyOn(usersService, 'findOne')
        .mockResolvedValue(new UserDTO());

      jest
        .spyOn(service, 'createFile')
        .mockResolvedValue(new MarkdownFileDTO());

      jest
        .spyOn(service, 'saveFile')
        .mockResolvedValue(new MarkdownFile());

      const response = await service.importFile(
        importDTO,
      );
      expect(response).toBeInstanceOf(
        MarkdownFileDTO,
      );
      expect(service.saveFile).toHaveBeenCalled();
    });
  });

  describe('exportFile', () => {
    it('should throw an error if MarkdownID is undefined', async () => {
      const exportDTO = new ExportDTO();
      exportDTO.UserID = 0;
      exportDTO.Content = 'test';

      try {
        await service.exportFile(exportDTO);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'MarkdownID cannot be undefined',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should throw an error if Content is undefined', async () => {
      const exportDTO = new ExportDTO();
      exportDTO.UserID = 0;
      exportDTO.MarkdownID = '1';

      try {
        await service.exportFile(exportDTO);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Content cannot be undefined',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should call convertTo method', async () => {
      const exportDTO = new ExportDTO();
      exportDTO.UserID = 0;
      exportDTO.MarkdownID = '1';
      exportDTO.Content = 'test';

      (
        jest.spyOn(
          conversionService,
          'convertTo',
        ) as any
      ).mockResolvedValue(new ExportDTO());

      jest
        .spyOn(usersService, 'findOne')
        .mockResolvedValue(new UserDTO());

      const response = await service.exportFile(
        exportDTO,
      );
      expect(response).toBeInstanceOf(ExportDTO);
      expect(
        conversionService.convertTo,
      ).toHaveBeenCalledWith(exportDTO);
    });
  });
});
