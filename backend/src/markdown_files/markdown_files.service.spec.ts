import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { MarkdownFilesService } from './markdown_files.service';
import { MarkdownFile } from './entities/markdown_file.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('MarkdownFilesService', () => {
  let service: MarkdownFilesService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          MarkdownFilesService,
          {
            provide:
              getRepositoryToken(MarkdownFile),
            useClass: Repository,
          },
        ],
      }).compile();

    service = module.get<MarkdownFilesService>(
      MarkdownFilesService,
    );
  });

  describe('root/config', () => {
    it('markdown file service should be defined', () => {
      expect(service).toBeDefined();
    });
  });
});
