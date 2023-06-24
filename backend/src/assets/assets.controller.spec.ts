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

  describe('root/config', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('create', () => {
    // TO-DO: implement unit tests
  });

  describe('findAll', () => {
    // TO-DO: implement unit tests
  });

  describe('findOne', () => {
    // TO-DO: implement unit tests
  });

  describe('update', () => {
    // TO-DO: implement unit tests
  });

  describe('remove', () => {
    // TO-DO: implement unit tests
  });
});
