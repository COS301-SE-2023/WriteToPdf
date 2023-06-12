import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { MarkdownFilesController } from './markdown_files.controller';
import { MarkdownFilesService } from './markdown_files.service';

describe('MarkdownFilesController', () => {
  let controller: MarkdownFilesController;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [MarkdownFilesController],
        providers: [MarkdownFilesService],
      }).compile();

    controller =
      module.get<MarkdownFilesController>(
        MarkdownFilesController,
      );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
