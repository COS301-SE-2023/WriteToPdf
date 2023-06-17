import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { FileManagerController } from './file_manager.controller';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import {
  HttpException,
  HttpStatus,
} from '@nestjs/common';

describe('FileManagerController', () => {
  let controller: FileManagerController;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [FileManagerController],
      }).compile();

    controller =
      module.get<FileManagerController>(
        FileManagerController,
      );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should throw exception if request method is not POST', async () => {
      const request = { method: 'GET' };
      const markdownFileDTO =
        new MarkdownFileDTO();

      try {
        await controller.create(
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
