import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { MarkdownFilesService } from './markdown_files.service';

describe('MarkdownFilesService', () => {
  let service: MarkdownFilesService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [MarkdownFilesService],
      }).compile();

    service = module.get<MarkdownFilesService>(
      MarkdownFilesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
