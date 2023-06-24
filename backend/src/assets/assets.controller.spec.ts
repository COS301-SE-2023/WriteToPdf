import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { Asset } from './entities/asset.entity';
import { AssetDTO } from './dto/asset.dto';
import { CreateAssetDTO } from './dto/create-asset.dto';
import { UpdateAssetDTO } from './dto/update-asset.dto';
import { AssetsModule } from './assets.module';

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
    it('controller should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('new asset object should be of type Asset', () => {
      const asset = new Asset();
      expect(asset).toBeInstanceOf(Asset);
    });

    it('new asset DTO should be of type AssetDTO', () => {
      const assetDTO = new AssetDTO();
      expect(assetDTO).toBeInstanceOf(AssetDTO);
    });

    it('new create-asset DTO should be of type CreateAssetDTO', () => {
      const createAssetDTO = new CreateAssetDTO();
      expect(createAssetDTO).toBeInstanceOf(
        CreateAssetDTO,
      );
    });

    it('new update-asset DTO should be of type UpdateAssetDTO', () => {
      const updateAssetDTO = new UpdateAssetDTO();
      expect(updateAssetDTO).toBeInstanceOf(
        UpdateAssetDTO,
      );
    });
  });

  describe('assets module', () => {
    it('new assetsModule object should be of type AssetsModule', () => {
      const assetsModule = new AssetsModule();
      expect(assetsModule).toBeInstanceOf(
        AssetsModule,
      );
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
