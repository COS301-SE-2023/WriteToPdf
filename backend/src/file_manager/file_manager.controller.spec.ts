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
import {
  TypeOrmModule,
  getRepositoryToken,
} from '@nestjs/typeorm';
import { MarkdownFile } from '../markdown_files/entities/markdown_file.entity';
import { Repository } from 'typeorm';
import { Folder } from '../folders/entities/folder.entity';
import { ConversionService } from '../conversion/conversion.service';
import { S3Service } from '../s3/s3.service';
import { UsersService } from '../users/users.service';
import { DirectoryFilesDTO } from './dto/directory_files.dto';
import { DirectoryFoldersDTO } from './dto/directory_folders.dto';
import { FolderDTO } from '../folders/dto/folder.dto';
import { ImportDTO } from './dto/import.dto';
// import { ExportDTO } from './dto/export.dto';
import { User } from '../users/entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';

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
          ConversionService,
          S3Service,
          UsersService,
          AuthService,
          JwtService,
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
          {
            provide: getRepositoryToken(User),
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
  });

  // File operations #################################################
  describe('create_file', () => {
    it('should throw an exception if request method is not POST', async () => {
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

    it('should throw an exception if UserID is undefined', () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.Path = 'test/test';
      markdownFileDTO.Name = 'test';

      expect(() =>
        controller.createFile(
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

    it('should return a MarkdownFileDTO', async () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.UserID = 123;
      markdownFileDTO.Path = 'test/test';
      markdownFileDTO.Name = 'test';

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
    it('should throw an exception if request method is not POST', async () => {
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

    it('should throw an exception if MarkdownID is undefined', () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.UserID = 123;
      markdownFileDTO.Path = 'test/test';
      markdownFileDTO.Name = 'test';
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

    it('should throw an exception if Name is undefined', () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.UserID = 123;
      markdownFileDTO.Path = 'test/test';
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

    it('should throw an exception if UserID is undefined', () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.Path = 'test/test';
      markdownFileDTO.Name = 'test';
      markdownFileDTO.MarkdownID = '123';

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

      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = '123';
      markdownFileDTO.UserID = 123;
      markdownFileDTO.Path = 'test/test';
      markdownFileDTO.Name = 'test';

      jest
        .spyOn(fileManagerService, 'renameFile')
        .mockResolvedValue(markdownFileDTO);

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
      expect(
        fileManagerService.renameFile,
      ).toHaveBeenCalledWith(markdownFileDTO);
    });
  });

  describe('delete_file', () => {
    it('should throw an exception if request method is not POST', async () => {
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

    it('should throw an exception if MarkdownID is undefined', async () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.UserID = 123;
      markdownFileDTO.Path = 'test/test';
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
          'Invalid request data',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should throw an exception if UserID is undefined', async () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = '123';
      markdownFileDTO.Path = 'test/test';
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
          'Invalid request data',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should return MarkdownFileDTO', async () => {
      const request = { method: 'POST' };

      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = '123';
      markdownFileDTO.UserID = 123;
      markdownFileDTO.Path = 'test/test';
      markdownFileDTO.Name = 'test';

      jest
        .spyOn(fileManagerService, 'deleteFile')
        .mockResolvedValue(markdownFileDTO);

      const result = await controller.deleteFile(
        markdownFileDTO,
        request as any,
      );

      expect(result).toBeInstanceOf(
        MarkdownFileDTO,
      );
      expect(
        fileManagerService.deleteFile,
      ).toHaveBeenCalledWith(markdownFileDTO);
    });
  });

  describe('move_file', () => {
    it('should throw an exception if request method is not POST', async () => {
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

    it('should throw an exception if MarkdownID is undefined', async () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.UserID = 123;
      markdownFileDTO.Path = 'test/test';
      markdownFileDTO.ParentFolderID = '123';

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
          'Invalid request data',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should throw an exception if Path is undefined', async () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = 'abc123';
      markdownFileDTO.UserID = 123;
      markdownFileDTO.ParentFolderID = '123';

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
          'Invalid request data',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should not throw an exception if ParentFolderID is empty', async () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = 'abc123';
      markdownFileDTO.UserID = 123;
      markdownFileDTO.ParentFolderID = '';
      markdownFileDTO.Path = 'test';

      jest
        .spyOn(fileManagerService, 'moveFile')
        .mockResolvedValue(markdownFileDTO);

      const controllerMethod = async () =>
        await controller.moveFile(
          markdownFileDTO,
          request as any,
        );

      expect(controllerMethod).not.toThrowError(
        new HttpException(
          'Invalid request data',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should not throw an exception if Path is empty', async () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = 'abc123';
      markdownFileDTO.UserID = 123;
      markdownFileDTO.ParentFolderID = '123';
      markdownFileDTO.Path = '';

      jest
        .spyOn(fileManagerService, 'moveFile')
        .mockResolvedValue(markdownFileDTO);

      const controllerMethod = async () =>
        await controller.moveFile(
          markdownFileDTO,
          request as any,
        );

      expect(controllerMethod).not.toThrowError(
        new HttpException(
          'Invalid request data',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an exception if ParentFolderID is undefined', async () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = 'abc123';
      markdownFileDTO.UserID = 123;
      markdownFileDTO.Path = 'test/test';

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
          'Invalid request data',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should throw an exception if UserID is undefined', async () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = 'abc123';
      markdownFileDTO.Path = 'test/test';
      markdownFileDTO.ParentFolderID = '123';

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
          'Invalid request data',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should return a markdownFileDTO', async () => {
      const request = { method: 'POST' };

      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = '123';
      markdownFileDTO.UserID = 123;
      markdownFileDTO.Path = 'test/test';
      markdownFileDTO.Name = 'test';
      markdownFileDTO.ParentFolderID = '123';

      jest
        .spyOn(fileManagerService, 'moveFile')
        .mockResolvedValue(markdownFileDTO);

      const result = await controller.moveFile(
        markdownFileDTO,
        request as any,
      );

      expect(result).toBeInstanceOf(
        MarkdownFileDTO,
      );
      expect(result.Name).toBe(
        markdownFileDTO.Name,
      );
      expect(result.ParentFolderID).toBe(
        markdownFileDTO.ParentFolderID,
      );
      expect(result.Path).toBe(
        markdownFileDTO.Path,
      );
      expect(
        fileManagerService.moveFile,
      ).toHaveBeenCalledWith(markdownFileDTO);
    });
  });

  describe('retrieve_file', () => {
    it('should throw an exception if request method is not POST', async () => {
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

    it('should throw an exception if UserID is undefined', async () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = '123';

      expect(() =>
        controller.retrieveFile(
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

    it('should throw an exception if MarkdownID is undefined', async () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.UserID = 123;

      expect(() =>
        controller.retrieveFile(
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

    it('should return a markdownFileDTO', async () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();

      markdownFileDTO.UserID = 123;
      markdownFileDTO.MarkdownID = '123';

      jest
        .spyOn(fileManagerService, 'retrieveFile')
        .mockResolvedValue(markdownFileDTO);

      const result =
        await controller.retrieveFile(
          markdownFileDTO,
          request as any,
        );

      expect(result).toBeInstanceOf(
        MarkdownFileDTO,
      );
      expect(result.Name).toBe(
        markdownFileDTO.Name,
      );
      expect(result.MarkdownID).toBe(
        markdownFileDTO.MarkdownID,
      );
      expect(
        fileManagerService.retrieveFile,
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
    it('should throw an error if method is not POST', async () => {
      const request = { method: 'GET' };
      const markdownFileDTO =
        new MarkdownFileDTO();

      try {
        await controller.save(
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

    it('should throw an exception if UserID is undefined', async () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = '123';
      markdownFileDTO.Content = ' ';

      expect(() =>
        controller.save(
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

    it('should throw an exception if MarkdownID is undefined', async () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.UserID = 123;
      markdownFileDTO.Content = ' ';

      try {
        await controller.save(
          markdownFileDTO,
          request as any,
        );
        expect(true).toBe(false);
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

    it('should throw an exception if Content is undefined', async () => {
      const request = { method: 'POST' };
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.UserID = 123;
      markdownFileDTO.MarkdownID = '123';

      try {
        await controller.save(
          markdownFileDTO,
          request as any,
        );
        expect(true).toBe(false);
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

    it('should return MarkdownfileDTO', async () => {
      const request = { method: 'POST' };

      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = '123';
      markdownFileDTO.UserID = 123;
      markdownFileDTO.Content = ' ';

      jest
        .spyOn(fileManagerService, 'saveFile')
        .mockResolvedValue(markdownFileDTO);

      const result = await controller.save(
        markdownFileDTO,
        request as any,
      );

      expect(result).toBeInstanceOf(
        MarkdownFileDTO,
      );
      expect(result.MarkdownID).toBe(
        markdownFileDTO.MarkdownID,
      );
      expect(result.UserID).toBe(
        markdownFileDTO.UserID,
      );
      expect(
        fileManagerService.saveFile,
      ).toHaveBeenCalledWith(markdownFileDTO);
    });
  });

  describe('retrieve_all_files', () => {
    it('should throw an exception if request method is not POST', async () => {
      const request = { method: 'GET' };
      const directoryFilesDTO =
        new DirectoryFilesDTO();
      try {
        await controller.retrieveAllFiles(
          directoryFilesDTO,
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

    it('should throw an exception if UserID is undefined', async () => {
      const request = { method: 'POST' };
      const directoryFilesDTO =
        new DirectoryFilesDTO();
      try {
        await controller.retrieveAllFiles(
          directoryFilesDTO,
          request as any,
        );
        expect(true).toBe(false);
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

    it('should return a DirectoryFilesDTO', async () => {
      const request = { method: 'POST' };

      const directoryFilesDTO =
        new DirectoryFilesDTO();
      directoryFilesDTO.UserID = 123;

      jest
        .spyOn(
          fileManagerService,
          'retrieveAllFiles',
        )
        .mockResolvedValue(directoryFilesDTO);

      const result =
        await controller.retrieveAllFiles(
          directoryFilesDTO,
          request as any,
        );

      expect(result).toBeInstanceOf(
        DirectoryFilesDTO,
      );
      expect(result.UserID).toBe(
        directoryFilesDTO.UserID,
      );
      expect(
        fileManagerService.retrieveAllFiles,
      ).toHaveBeenCalledWith(directoryFilesDTO);
    });
  });

  // Folder operations ################################################
  describe('create_folder', () => {
    it('should throw an exception if request method is not POST', async () => {
      const request = { method: 'GET' };
      const folderDTO = new FolderDTO();

      try {
        await controller.createFolder(
          folderDTO,
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

    it('should throw an exception if UserID is undefined', () => {
      const request = { method: 'POST' };
      const folderDTO = new FolderDTO();
      folderDTO.Path = 'test/test';
      folderDTO.FolderName = 'test';

      expect(() =>
        controller.createFolder(
          folderDTO,
          request as any,
        ),
      ).toThrowError(
        new HttpException(
          'Invalid request data',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an exception if FolderName is undefined', () => {
      const request = { method: 'POST' };
      const folderDTO = new FolderDTO();
      folderDTO.Path = 'test/test';
      folderDTO.UserID = 123;

      expect(() =>
        controller.createFolder(
          folderDTO,
          request as any,
        ),
      ).toThrowError(
        new HttpException(
          'Invalid request data',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should not throw an exception if Path is empty', () => {
      const request = { method: 'POST' };
      const folderDTO = new FolderDTO();
      folderDTO.FolderName = 'test';
      folderDTO.UserID = 123;
      folderDTO.Path = '';

      expect(() =>
        controller.createFolder(
          folderDTO,
          request as any,
        ),
      ).not.toThrowError(
        new HttpException(
          'Invalid request data',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an exception if Path is undefined', () => {
      const request = { method: 'POST' };
      const folderDTO = new FolderDTO();
      folderDTO.FolderName = 'test';
      folderDTO.UserID = 123;

      expect(() =>
        controller.createFolder(
          folderDTO,
          request as any,
        ),
      ).toThrowError(
        new HttpException(
          'Invalid request data',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should return a FolderDTO', async () => {
      const request = { method: 'POST' };
      const folderDTO = new FolderDTO();
      folderDTO.UserID = 123;
      folderDTO.Path = 'test/test';
      folderDTO.FolderName = 'test';

      jest
        .spyOn(fileManagerService, 'createFolder')
        .mockResolvedValue(folderDTO);

      const result =
        await controller.createFolder(
          folderDTO,
          request as any,
        );

      expect(result).toBeInstanceOf(FolderDTO);
      expect(result.UserID).toBe(
        folderDTO.UserID,
      );
      expect(result.Path).toBe(folderDTO.Path);
      expect(result.FolderName).toBe(
        folderDTO.FolderName,
      );
      expect(
        fileManagerService.createFolder,
      ).toBeCalledWith(folderDTO);
    });
  });

  describe('delete_folder', () => {
    it('should throw an exception if request method is not POST', async () => {
      const request = { method: 'GET' };
      const folderDTO = new FolderDTO();

      try {
        await controller.deleteFolder(
          folderDTO,
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

    it('should throw an exception if FolderID is undefined', async () => {
      const request = { method: 'POST' };
      const folderDTO = new FolderDTO();
      folderDTO.UserID = 123;

      try {
        await controller.deleteFolder(
          folderDTO,
          request as any,
        );
        expect(true).toBe(false);
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

    it('should throw an exception if UserID is undefined', async () => {
      const request = { method: 'POST' };
      const folderDTO = new FolderDTO();
      folderDTO.FolderID = '123';

      try {
        await controller.deleteFolder(
          folderDTO,
          request as any,
        );
        expect(true).toBe(false);
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

    it('should return a FolderDTO', async () => {
      const request = { method: 'POST' };

      const folderDTO = new FolderDTO();
      folderDTO.FolderID = '123';
      folderDTO.UserID = 123;

      jest
        .spyOn(fileManagerService, 'deleteFolder')
        .mockResolvedValue(folderDTO);

      const result =
        await controller.deleteFolder(
          folderDTO,
          request as any,
        );

      expect(result).toBeInstanceOf(FolderDTO);
      expect(
        fileManagerService.deleteFolder,
      ).toHaveBeenCalledWith(folderDTO);
    });
  });

  describe('rename_folder', () => {
    it('should throw an exception if request method is not POST', async () => {
      const request = { method: 'GET' };
      const folderDTO = new FolderDTO();

      try {
        await controller.renameFolder(
          folderDTO,
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

    it('should throw an exception if FolderID is undefined', () => {
      const request = { method: 'POST' };
      const folderDTO = new FolderDTO();
      folderDTO.UserID = 123;
      folderDTO.FolderName = 'test';

      expect(() =>
        controller.renameFolder(
          folderDTO,
          request as any,
        ),
      ).toThrowError(
        new HttpException(
          'Invalid request data',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an exception if FolderName is undefined', () => {
      const request = { method: 'POST' };
      const folderDTO = new FolderDTO();
      folderDTO.UserID = 123;
      folderDTO.FolderID = 'abc123';

      expect(() =>
        controller.renameFolder(
          folderDTO,
          request as any,
        ),
      ).toThrowError(
        new HttpException(
          'Invalid request data',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an exception if UserID is undefined', () => {
      const request = { method: 'POST' };
      const folderDTO = new FolderDTO();
      folderDTO.FolderName = 'test';
      folderDTO.FolderID = '123';

      expect(() =>
        controller.renameFolder(
          folderDTO,
          request as any,
        ),
      ).toThrowError(
        new HttpException(
          'Invalid request data',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should return a FolderDTO', async () => {
      const request = { method: 'POST' };

      const folderDTO = new FolderDTO();
      folderDTO.FolderID = '123';
      folderDTO.UserID = 123;
      folderDTO.FolderName = 'test';

      jest
        .spyOn(fileManagerService, 'renameFolder')
        .mockResolvedValue(folderDTO);

      const result =
        await controller.renameFolder(
          folderDTO,
          request as any,
        );

      expect(result).toBeInstanceOf(FolderDTO);
      expect(result.FolderName).toBe(
        folderDTO.FolderName,
      );
      expect(
        fileManagerService.renameFolder,
      ).toHaveBeenCalledWith(folderDTO);
    });
  });

  describe('move_folder', () => {
    it('should throw an exception if request method is not POST', async () => {
      const request = { method: 'GET' };
      const folderDTO = new FolderDTO();

      try {
        await controller.moveFolder(
          folderDTO,
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

    it('should throw an exception if FolderID is undefined', async () => {
      const request = { method: 'POST' };
      const folderDTO = new FolderDTO();
      folderDTO.UserID = 123;
      folderDTO.Path = 'test/test';
      folderDTO.ParentFolderID = '123';

      try {
        await controller.moveFolder(
          folderDTO,
          request as any,
        );
        expect(true).toBe(false);
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

    it('should throw an exception if Path is undefined', async () => {
      const request = { method: 'POST' };
      const folderDTO = new FolderDTO();
      folderDTO.FolderID = 'abc123';
      folderDTO.UserID = 123;
      folderDTO.ParentFolderID = '123';

      try {
        await controller.moveFolder(
          folderDTO,
          request as any,
        );
        expect(true).toBe(false);
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

    it('should throw an exception if ParentFolderID is undefined', async () => {
      const request = { method: 'POST' };
      const folderDTO = new FolderDTO();
      folderDTO.FolderID = 'abc123';
      folderDTO.UserID = 123;
      folderDTO.Path = 'test/test';

      try {
        await controller.moveFolder(
          folderDTO,
          request as any,
        );
        expect(true).toBe(false);
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

    it('should throw an exception if UserID is undefined', async () => {
      const request = { method: 'POST' };
      const folderDTO = new FolderDTO();
      folderDTO.FolderID = 'abc123';
      folderDTO.Path = 'test/test';
      folderDTO.ParentFolderID = '123';

      try {
        await controller.moveFolder(
          folderDTO,
          request as any,
        );
        expect(true).toBe(false);
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
    it('should not throw an exception if ParentFolderID is empty', async () => {
      const request = { method: 'POST' };
      const folderDTO = new FolderDTO();
      folderDTO.FolderID = 'abc123';
      folderDTO.UserID = 123;
      folderDTO.ParentFolderID = '';
      folderDTO.Path = 'test';

      jest
        .spyOn(fileManagerService, 'moveFolder')
        .mockResolvedValue(folderDTO);

      const controllerMethod = async () =>
        await controller.moveFolder(
          folderDTO,
          request as any,
        );

      expect(controllerMethod).not.toThrowError(
        new HttpException(
          'Invalid request data',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should not throw an exception if Path is empty', async () => {
      const request = { method: 'POST' };
      const folderDTO = new FolderDTO();
      folderDTO.FolderID = 'abc123';
      folderDTO.UserID = 123;
      folderDTO.ParentFolderID = '123';
      folderDTO.Path = '';

      jest
        .spyOn(fileManagerService, 'moveFolder')
        .mockResolvedValue(folderDTO);

      const controllerMethod = async () =>
        await controller.moveFolder(
          folderDTO,
          request as any,
        );

      expect(controllerMethod).not.toThrowError(
        new HttpException(
          'Invalid request data',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should return a FolderDTO', async () => {
      const request = { method: 'POST' };

      const folderDTO = new FolderDTO();
      folderDTO.FolderID = '123';
      folderDTO.UserID = 123;
      folderDTO.Path = 'test/test';
      folderDTO.ParentFolderID = '123';

      jest
        .spyOn(fileManagerService, 'moveFolder')
        .mockResolvedValue(folderDTO);

      const result = await controller.moveFolder(
        folderDTO,
        request as any,
      );

      expect(result).toBeInstanceOf(FolderDTO);
      expect(result.ParentFolderID).toBe(
        folderDTO.ParentFolderID,
      );
      expect(result.Path).toBe(folderDTO.Path);
      expect(
        fileManagerService.moveFolder,
      ).toHaveBeenCalledWith(folderDTO);
    });
  });

  describe('retrieve_all_folders', () => {
    it('should throw an exception if request method is not POST', async () => {
      const request = { method: 'GET' };
      const directoryFoldersDTO =
        new DirectoryFoldersDTO();
      try {
        await controller.retrieveAllFolders(
          directoryFoldersDTO,
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

    it('should throw an exception if UserID is undefined', async () => {
      const request = { method: 'POST' };
      const directoryFoldersDTO =
        new DirectoryFoldersDTO();
      try {
        await controller.retrieveAllFolders(
          directoryFoldersDTO,
          request as any,
        );
        expect(true).toBe(false);
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

    it('should return a DirectoryFoldersDTO', async () => {
      const request = { method: 'POST' };

      const directoryFoldersDTO =
        new DirectoryFoldersDTO();
      directoryFoldersDTO.UserID = 123;

      jest
        .spyOn(
          fileManagerService,
          'retrieveAllFolders',
        )
        .mockResolvedValue(directoryFoldersDTO);

      const result =
        await controller.retrieveAllFolders(
          directoryFoldersDTO,
          request as any,
        );

      expect(result).toBeInstanceOf(
        DirectoryFoldersDTO,
      );
      expect(result.UserID).toBe(
        directoryFoldersDTO.UserID,
      );
      expect(
        fileManagerService.retrieveAllFolders,
      ).toHaveBeenCalledWith(directoryFoldersDTO);
    });
  });

  // Import & Export operations #################################################
  describe('import', () => {
    it('should throw an exception if request method is not POST', async () => {
      const request = { method: 'GET' };
      const importDTO = new ImportDTO();

      try {
        await controller.import(
          importDTO,
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

    it('should throw an exception if UserID is undefined', () => {
      const request = { method: 'POST' };
      const importDTO = new ImportDTO();
      importDTO.Path = 'test/test';
      importDTO.Type = 'test';
      importDTO.Content = 'test';
      importDTO.Name = 'test';
      importDTO.ParentFolderID = '123';

      expect(() =>
        controller.import(
          importDTO,
          request as any,
        ),
      ).toThrowError(
        new HttpException(
          'Invalid request data',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an exception if Name is undefined', () => {
      const request = { method: 'POST' };
      const importDTO = new ImportDTO();
      importDTO.Path = 'test/test';
      importDTO.Type = 'test';
      importDTO.UserID = 123;
      importDTO.Content = 'test';
      importDTO.ParentFolderID = '123';

      expect(() =>
        controller.import(
          importDTO,
          request as any,
        ),
      ).toThrowError(
        new HttpException(
          'Invalid request data',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an exception if Type is undefined', () => {
      const request = { method: 'POST' };
      const importDTO = new ImportDTO();
      importDTO.UserID = 123;
      importDTO.Path = 'test/test';
      importDTO.Content = 'test';
      importDTO.ParentFolderID = '123';
      importDTO.Name = 'test';

      expect(() =>
        controller.import(
          importDTO,
          request as any,
        ),
      ).toThrowError(
        new HttpException(
          'Invalid request data',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an exception if Content is undefined', () => {
      const request = { method: 'POST' };
      const importDTO = new ImportDTO();
      importDTO.UserID = 123;
      importDTO.Type = 'test';
      importDTO.Path = 'test/test';
      importDTO.ParentFolderID = '123';
      importDTO.Name = 'test';

      expect(() =>
        controller.import(
          importDTO,
          request as any,
        ),
      ).toThrowError(
        new HttpException(
          'Invalid request data',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an exception if ParentFolderID is undefined', () => {
      const request = { method: 'POST' };
      const importDTO = new ImportDTO();
      importDTO.UserID = 123;
      importDTO.Path = 'test/test';
      importDTO.Content = 'test';
      importDTO.Type = 'test';
      importDTO.Name = 'test';

      expect(() =>
        controller.import(
          importDTO,
          request as any,
        ),
      ).toThrowError(
        new HttpException(
          'Invalid request data',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an exception if Path is undefined', () => {
      const request = { method: 'POST' };
      const importDTO = new ImportDTO();
      importDTO.UserID = 123;
      importDTO.Content = 'test';
      importDTO.ParentFolderID = '123';
      importDTO.Type = 'test';
      importDTO.Name = 'test';

      expect(() =>
        controller.import(
          importDTO,
          request as any,
        ),
      ).toThrowError(
        new HttpException(
          'Invalid request data',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should return a MarkdownFileDTO', async () => {
      const request = { method: 'POST' };
      const importDTO = new ImportDTO();
      importDTO.UserID = 123;
      importDTO.Path = 'test/test';
      importDTO.Name = 'test';
      importDTO.Type = 'test';
      importDTO.Content = 'test';
      importDTO.ParentFolderID = '123';

      jest
        .spyOn(fileManagerService, 'importFile')
        .mockResolvedValue(new MarkdownFileDTO());

      const result = await controller.import(
        importDTO,
        request as any,
      );

      expect(result).toBeInstanceOf(
        MarkdownFileDTO,
      );
      expect(
        fileManagerService.importFile,
      ).toBeCalledWith(importDTO);
    });
  });

  // describe('export', () => {
  //   it('should throw an exception if request method is not POST', async () => {
  //     const request = { method: 'GET' };
  //     const exportDTO = new ExportDTO();

  //     try {
  //       await controller.export(
  //         exportDTO,
  //         request as any,
  //       );
  //       expect(true).toBe(false);
  //     } catch (error) {
  //       expect(error).toBeInstanceOf(
  //         HttpException,
  //       );
  //       expect(error.message).toBe(
  //         'Method Not Allowed',
  //       );
  //       expect(error.status).toBe(
  //         HttpStatus.METHOD_NOT_ALLOWED,
  //       );
  //     }
  //   });

  //   it('should throw an exception if UserID is undefined', () => {
  //     const request = { method: 'POST' };
  //     const exportDTO = new ExportDTO();
  //     exportDTO.Type = 'test';
  //     exportDTO.MarkdownID = 'test';

  //     expect(() =>
  //       controller.export(
  //         exportDTO,
  //         request as any,
  //       ),
  //     ).toThrowError(
  //       new HttpException(
  //         'Invalid request data',
  //         HttpStatus.BAD_REQUEST,
  //       ),
  //     );
  //   });

  //   it('should throw an exception if Type is undefined', () => {
  //     const request = { method: 'POST' };
  //     const exportDTO = new ExportDTO();
  //     exportDTO.UserID = 123;
  //     exportDTO.MarkdownID = 'test';

  //     expect(() =>
  //       controller.export(
  //         exportDTO,
  //         request as any,
  //       ),
  //     ).toThrowError(
  //       new HttpException(
  //         'Invalid request data',
  //         HttpStatus.BAD_REQUEST,
  //       ),
  //     );
  //   });

  //   it('should throw an exception if MarkdownID is undefined', () => {
  //     const request = { method: 'POST' };
  //     const exportDTO = new ExportDTO();
  //     exportDTO.UserID = 123;
  //     exportDTO.MarkdownID = '123';

  //     expect(() =>
  //       controller.export(
  //         exportDTO,
  //         request as any,
  //       ),
  //     ).toThrowError(
  //       new HttpException(
  //         'Invalid request data',
  //         HttpStatus.BAD_REQUEST,
  //       ),
  //     );
  //   });

  //   it('should return a MarkdownFileDTO', async () => {
  //     const request = { method: 'POST' };
  //     const exportDTO = new ExportDTO();
  //     exportDTO.UserID = 123;
  //     exportDTO.Type = 'test';
  //     exportDTO.MarkdownID = '123';

  //     jest
  //       .spyOn(fileManagerService, 'exportFile')
  //       .mockResolvedValue(exportDTO);

  //     const result = await controller.export(
  //       exportDTO,
  //       request as any,
  //     );

  //     expect(result).toBeInstanceOf(ExportDTO);
  //     expect(
  //       fileManagerService.exportFile,
  //     ).toBeCalledWith(exportDTO);
  //   });
  // });
});
