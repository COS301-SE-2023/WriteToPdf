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

  describe('root', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('create', () => {
    // console.log('FoldersController.create');
  });

  describe('findAll', () => {
    // console.log('FoldersController.findAll');
  });

  describe('findOne', () => {
    // console.log('FoldersController.findOne');
  });

  describe('update', () => {
    // console.log('FoldersController.update');
  });

  describe('remove', () => {
    // console.log('FoldersController.remove');
  });
});
