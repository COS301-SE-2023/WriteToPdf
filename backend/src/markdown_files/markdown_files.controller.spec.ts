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
import { CreateMarkdownFileDTO } from './dto/create-markdown_file.dto';

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

  describe('findAll', () => {
    it('should return an array of markdownFiles', async () => {
        const expectedMessage = `This action returns all markdownFiles`;
        const result = controller.findAll();
        expect(result).toEqual(expectedMessage);
    });
  });

  describe('create', () => {
    it('should create a new markdownFile', async () => {
        const createMarkdownFileDTO =  new CreateMarkdownFileDTO();
        createMarkdownFileDTO.Name = "test.md";
        createMarkdownFileDTO.ID = 123;
        const expectedMessage = "This action adds a new markdownFile";
        const result = controller.create(createMarkdownFileDTO);
        expect(result).toEqual(expectedMessage);
    });
  });

  describe('update', () => {
    it('should update a markdownFile', async () => {
        const id = 123; // Provide a valid ID for testing
        const updateMarkdownFileDTO =  new CreateMarkdownFileDTO();
        updateMarkdownFileDTO.Name = "test.md";
        updateMarkdownFileDTO.ID = 123;
        const expectedMessage = `This action updates md file with id: #${id}`;
        const result = controller.update(id, updateMarkdownFileDTO);
        expect(result).toEqual(expectedMessage);
    });
  });

});
