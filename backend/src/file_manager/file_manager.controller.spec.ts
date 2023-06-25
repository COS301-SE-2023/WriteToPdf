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
import { FileManagerModule } from './file_manager.module';
import { DirectoryFilesDTO } from './dto/directory_files.dto';

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

  describe('root/config', () => {
    it('controller should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('new file_manager module should be correcly instantiated', () => {
    it('new file_managerModule object should be of type FileManagerModule', () => {
      const file_managerModule =
        new FileManagerModule();
      expect(file_managerModule).toBeInstanceOf(
        FileManagerModule,
      );
    });
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

    // it('should set Path if Path is undefined', async () => {
    //   const request = { method: 'POST' };
    //   const markdownFileDTO =
    //     new MarkdownFileDTO();
    //   jest
    //     .spyOn(controller, 'createFile')
    //     .mockImplementation(
    //       async () => markdownFileDTO,
    //     );
    //   await controller.createFile(
    //     markdownFileDTO,
    //     request as any,
    //   );
    //   expect(markdownFileDTO.Path).toBe('');
    // });
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
          'MarkdownID cannot be undefined',
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
          'Name cannot be undefined',
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
          'MarkdownID cannot be undefined',
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
          'MarkdownID cannot be undefined',
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
          'Path cannot be undefined',
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
          'MarkdownID cannot be undefined',
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
  });
});
