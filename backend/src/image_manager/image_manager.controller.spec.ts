import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { ImageManagerController } from './image_manager.controller';
import { ImageManagerService } from './image_manager.service';

describe('ImageManagerController', () => {
  let controller: ImageManagerController;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [ImageManagerController],
        providers: [ImageManagerService],
      }).compile();

    controller =
      module.get<ImageManagerController>(
        ImageManagerController,
      );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
