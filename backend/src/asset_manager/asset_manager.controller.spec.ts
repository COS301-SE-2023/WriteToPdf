import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { AssetManagerController } from './asset_manager.controller';
import { AssetManagerService } from './asset_manager.service';

describe('AssetManagerController', () => {
  let controller: AssetManagerController;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [AssetManagerController],
        providers: [AssetManagerService],
      }).compile();

    controller =
      module.get<AssetManagerController>(
        AssetManagerController,
      );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
