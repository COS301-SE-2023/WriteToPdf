import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';

describe('FoldersController', () => {
  let controller: FoldersController;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [FoldersController],
        providers: [FoldersService],
      }).compile();

    controller = module.get<FoldersController>(
      FoldersController,
    );
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('create', () => {
    console.log('FoldersController.create');
  });

  describe('findAll', () => {
    console.log('FoldersController.findAll');
  });

  describe('findOne', () => {
    console.log('FoldersController.findOne');
  });

  describe('update', () => {
    console.log('FoldersController.update');
  });

  describe('remove', () => {
    console.log('FoldersController.remove');
  });
});
