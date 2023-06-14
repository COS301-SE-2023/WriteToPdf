import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';

describe('AssetsController', () => {
  let controller: AssetsController;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [AssetsController],
        providers: [AssetsService],
      }).compile();

    controller = module.get<AssetsController>(
      AssetsController,
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
