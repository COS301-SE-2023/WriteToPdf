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

  describe('create', () => {});

  describe('findAll', () => {});

  describe('findOne', () => {});

  describe('update', () => {});

  describe('remove', () => {});
});
