import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { AssetManagerController } from './asset_manager.controller';
import { AssetManagerService } from './asset_manager.service';
import { ImageManagerService } from '../image_manager/image_manager.service';
import { AssetsService } from '../assets/assets.service';
import { S3Service } from '../s3/s3.service';
import { TextManagerService } from '../text_manager/text_manager.service';
import { Asset } from '../assets/entities/asset.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AssetDTO } from '../assets/dto/asset.dto';
import { RetrieveAllDTO } from './dto/retrieve_all.dto';

describe('AssetManagerController', () => {
  let controller: AssetManagerController;
  let assetManagerService: AssetManagerService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [AssetManagerController],
        providers: [
          AssetManagerService,
          ImageManagerService,
          AssetsService,
          S3Service,
          TextManagerService,
          {
            provide: getRepositoryToken(Asset),
            useClass: Repository,
          },
          AuthService,
          JwtService,
        ],
      }).compile();

    controller =
      module.get<AssetManagerController>(
        AssetManagerController,
      );
    assetManagerService =
      module.get<AssetManagerService>(
        AssetManagerService,
      );
  });

  describe('upload_asset', () => {
    it('should return an AssetDTO', async () => {
      const assetDTO = new AssetDTO();
      assetDTO.AssetID = 'test';
      assetDTO.UserID = 1;

      jest
        .spyOn(
          assetManagerService,
          'upload_asset',
        )
        .mockResolvedValue(assetDTO);

      const response =
        await controller.upload_asset(assetDTO);

      expect(response).toBe(assetDTO);
      expect(
        assetManagerService.upload_asset,
      ).toHaveBeenCalledWith(assetDTO);
    });
  });

  describe('retrieve_all', () => {
    it('should return an array of AssetDTOs', async () => {
      const assetDTO = new AssetDTO();
      assetDTO.AssetID = 'test';
      assetDTO.UserID = 1;

      const retrieveAllDTO = new RetrieveAllDTO();
      retrieveAllDTO.UserID = 1;

      jest
        .spyOn(
          assetManagerService,
          'retrieve_all',
        )
        .mockResolvedValue([assetDTO]);

      const response =
        await controller.retrieve_all(
          retrieveAllDTO,
        );

      expect(response).toEqual([assetDTO]);
      expect(
        assetManagerService.retrieve_all,
      ).toHaveBeenCalledWith(retrieveAllDTO);
    });
  });

  describe('retrieve_one', () => {
    it('should return an AssetDTO', async () => {
      const assetDTO = new AssetDTO();
      assetDTO.AssetID = 'test';
      assetDTO.UserID = 1;

      jest
        .spyOn(
          assetManagerService,
          'retrieve_one',
        )
        .mockResolvedValue(assetDTO);

      const response =
        await controller.retrieve_one(assetDTO);

      expect(response).toBe(assetDTO);
      expect(
        assetManagerService.retrieve_one,
      ).toHaveBeenCalledWith(assetDTO);
    });
  });

  describe('rename_asset', () => {
    it('should return an AssetDTO', async () => {
      const assetDTO = new AssetDTO();
      assetDTO.AssetID = 'test';
      assetDTO.UserID = 1;

      jest
        .spyOn(
          assetManagerService,
          'rename_asset',
        )
        .mockResolvedValue(assetDTO);

      const response =
        await controller.rename_asset(assetDTO);

      expect(response).toBe(assetDTO);
      expect(
        assetManagerService.rename_asset,
      ).toHaveBeenCalledWith(assetDTO);
    });
  });
});
