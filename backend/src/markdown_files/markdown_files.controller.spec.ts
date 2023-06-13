import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { MarkdownFilesController } from './markdown_files.controller';
import { MarkdownFilesService } from './markdown_files.service';
import { testingModule } from '../test-utils/testingModule';
import { MarkdownFile } from './entities/markdown_file.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';

describe('MarkdownFilesController', () => {
  let controller: MarkdownFilesController;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        imports: [...testingModule()],
        controllers: [MarkdownFilesController],
        providers: [
          MarkdownFilesService,
          {
            provide:
              getRepositoryToken(MarkdownFile),
            useClass: Repository,
          },
          {
            provide: AuthService,
            useValue: {
              generateToken: jest.fn(),
            },
          },
        ],
      }).compile();

    controller =
      module.get<MarkdownFilesController>(
        MarkdownFilesController,
      );

    module.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return the requested markdownFile by id', async () => {
        const id = 123; // Provide a valid ID for testing
        const expectedMessage = `This action returns the markdownFile with id: #${id}`;
        const result = controller.findOne(id);
        expect(result).toEqual(expectedMessage);
    });
  });
});
