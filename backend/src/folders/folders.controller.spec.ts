import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';
import { testingModule } from '../test-utils/testingModule';
import { Folder } from './entities/folder.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('FoldersController', () => {
  let controller: FoldersController;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        imports: [...testingModule()],
        controllers: [FoldersController],
        providers: [
          FoldersService,
          {
            provide: getRepositoryToken(Folder),
            useClass: Repository,
          },
        ],
      }).compile();

    controller = module.get<FoldersController>(
      FoldersController,
    );
    module.close();
  });

  describe('root/config', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('create', () => {
    // TO-DO: create unit tests
  });

  describe('findAll', () => {
    // TO-DO: create unit tests
  });

  describe('findOne', () => {
    // TO-DO: create unit tests
  });

  describe('update', () => {
    // TO-DO: create unit tests
  });

  describe('remove', () => {
    // TO-DO: create unit tests
  });
});
