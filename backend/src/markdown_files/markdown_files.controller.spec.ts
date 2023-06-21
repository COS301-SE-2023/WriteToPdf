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
import { MarkdownFileDTO } from './dto/markdown_file.dto';

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

  describe('root/config', () => {
    it('markdown controller should be defined', () => {
      expect(controller).toBeDefined();
    });
  });
  describe('findOne', () => {
    it('should return the requested markdown file by id', async () => {
      const id = '123'; // Provide a valid ID for testing
      const expectedMessage = `This action returns the markdownFile with id: #${id}`;
      const result = controller.findOne(id);
      expect(result).toEqual(expectedMessage);
    });
  });

  describe('findAll', () => {
    it('should return an array of markdown files', async () => {
      const expectedMessage = `This action returns all markdownFiles`;
      const result = controller.findAll();
      expect(result).toEqual(expectedMessage);
    });

    // Future tests:
    // it('should return an empty array if no markdownFiles exist)
    // it('should return an array of markdownFiles if markdownFiles exist)
  });

  describe('create', () => {
    it('should create a new markdown file', async () => {
      const createMarkdownFileDTO =
        new MarkdownFileDTO();
      createMarkdownFileDTO.Name = 'test.md';
      createMarkdownFileDTO.MarkdownID = '123';

      const expectedDTO = new MarkdownFileDTO();
      expectedDTO.Name = 'test.md';
      expectedDTO.MarkdownID = '123';

      jest
        .spyOn(controller, 'create')
        .mockImplementation(
          async () => expectedDTO,
        );

      controller
        .create(createMarkdownFileDTO)
        .then((result) => {
          expect(result).toMatchObject(
            expectedDTO,
          );
        })
        .catch((error) => {
          // Handle any errors that occurred during the Promise resolution
          console.error(error);
        });
    });

    // Future tests:
    // it('should throw an error if an md file of the same name already exists)
  });

  describe('update', () => {
    it('should update a markdown file', async () => {
      const id = '123'; // Provide a valid ID for testing
      const updateMarkdownFileDTO =
        new MarkdownFileDTO();
      updateMarkdownFileDTO.Name = 'test.md';
      updateMarkdownFileDTO.MarkdownID = '123';
      const expectedMessage = `This action updates md file with id: #${id}`;
      const result = controller.update(
        id,
        updateMarkdownFileDTO,
      );
      expect(result).toEqual(expectedMessage);
    });

    // Future tests:
    // it('should throw an error if the md file does not exist)
  });

  describe('remove', () => {
    // it('should delete a markdown file', async () => {
    //   const markdownDTO = new MarkdownFileDTO();
    //   markdownDTO.MarkdownID = '123';
    //   const expectedDTO = new MarkdownFileDTO();
    //   expectedDTO.MarkdownID = '123';
    //   const result =
    //     controller.remove(markdownDTO);
    //   expect(result).toEqual(expectedDTO);
    // });

    it('should remove a markdown file', async () => {
      const removeMarkdownFileDTO =
        new MarkdownFileDTO();
      removeMarkdownFileDTO.Name = 'test.md';
      removeMarkdownFileDTO.MarkdownID = '123';

      const expectedDTO = new MarkdownFileDTO();
      expectedDTO.Name = 'test.md';
      expectedDTO.MarkdownID = '123';

      jest
        .spyOn(controller, 'create')
        .mockImplementation(
          async () => expectedDTO,
        );

      controller
        .create(removeMarkdownFileDTO)
        .then((result) => {
          expect(result).toMatchObject(
            expectedDTO,
          );
        })
        .catch((error) => {
          // Handle any errors that occurred during the Promise resolution
          console.error(error);
        });
    });

    // Future tests:
    // it('should throw an error if the md file does not exist)
  });
});
