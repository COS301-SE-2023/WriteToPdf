import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { ImageManagerService } from './image_manager.service';

describe('ImageManagerService', () => {
  let service: ImageManagerService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [ImageManagerService],
      }).compile();

    service = module.get<ImageManagerService>(
      ImageManagerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
