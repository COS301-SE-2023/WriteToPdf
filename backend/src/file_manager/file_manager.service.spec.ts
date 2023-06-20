import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { FileManagerService } from './file_manager.service';
import { MarkdownFilesService } from '../markdown_files/markdown_files.service';
import { FoldersService } from '../folders/folders.service';

describe('FileManagerService', () => {
  let service: FileManagerService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          FileManagerService,
          MarkdownFilesService,
          FoldersService,
        ],
      }).compile();

    service = module.get<FileManagerService>(
      FileManagerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
