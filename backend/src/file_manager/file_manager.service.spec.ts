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

describe('FileManagerService', () => {
  let fileManagerService: FileManagerService;
  let markdownFilesService: MarkdownFilesService;
  let foldersService: FoldersService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        imports: [...testingModule()],
        providers: [
          FileManagerService,
          MarkdownFilesService,
          FoldersService,
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
        FileManagerService,
      );
    markdownFilesService =
      module.get<MarkdownFilesService>(
        MarkdownFilesService,
      );
    foldersService = module.get<FoldersService>(
      FoldersService,
    );

    module.close();
  });

  describe('root/config', () => {
    it('file manager service should be defined', () => {
      expect(fileManagerService).toBeDefined();
    });
  });
});
