import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { AssetManagerService } from './asset_manager.service';

describe('AssetManagerService', () => {
  let service: AssetManagerService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [AssetManagerService],
      }).compile();

    service = module.get<AssetManagerService>(
      AssetManagerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
