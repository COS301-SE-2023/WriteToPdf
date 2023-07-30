import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { AssetManagerController } from './asset_manager.controller';
import { AssetManagerService } from './asset_manager.service';
import { ImageManagerService } from '../image_manager/image_manager.service';
import { AssetsService } from '../assets/assets.service';
import { S3Service } from '../s3/s3.service';
import { S3ServiceMock } from '../s3/__mocks__/s3.service';
import { TextManagerService } from '../text_manager/text_manager.service';
import { Asset } from '../assets/entities/asset.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AssetDTO } from '../assets/dto/asset.dto';
import { RetrieveAllDTO } from './dto/retrieve_all.dto';
import {
  HttpException,
  HttpStatus,
} from '@nestjs/common';

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
          S3ServiceMock,
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
    it('should throw an error if UserID is missing', async () => {
      const assetDTO = new AssetDTO();
      assetDTO.AssetID = 'test';
      assetDTO.ParentFolderID = '';

      jest
        .spyOn(
          assetManagerService,
          'upload_asset',
        )
        .mockResolvedValue(assetDTO);

      expect(() =>
        controller.upload_asset(assetDTO, ''),
      ).toThrowError(
        new HttpException(
          'Invalid request data: UserID missing',
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(
        assetManagerService.upload_asset,
      ).not.toHaveBeenCalled();
    });

    it('should throw an error if ParentFolderID is missing', async () => {
      const assetDTO = new AssetDTO();
      assetDTO.AssetID = 'test';
      assetDTO.UserID = 9;

      jest
        .spyOn(
          assetManagerService,
          'upload_asset',
        )
        .mockResolvedValue(assetDTO);

      expect(() =>
        controller.upload_asset(assetDTO, ''),
      ).toThrowError(
        new HttpException(
          'Invalid request data: ParentFolderID missing',
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(
        assetManagerService.upload_asset,
      ).not.toHaveBeenCalled();
    });

    it('should return an AssetDTO', async () => {
      const assetDTO = new AssetDTO();
      assetDTO.AssetID = 'test';
      assetDTO.UserID = 1;
      assetDTO.ParentFolderID = '';
      const isTest = '';

      jest
        .spyOn(
          assetManagerService,
          'upload_asset',
        )
        .mockResolvedValue(assetDTO);

      const response =
        await controller.upload_asset(
          assetDTO,
          isTest,
        );

      expect(response).toBe(assetDTO);
      expect(
        assetManagerService.upload_asset,
      ).toHaveBeenCalledWith(
        assetDTO,
        isTest && isTest === 'true',
      );
    });
  });

  describe('retrieve_all', () => {
    it('should throw an error if UserID is missing', async () => {
      const retrieveAllDTO = new RetrieveAllDTO();

      expect(() =>
        controller.retrieve_all(
          retrieveAllDTO,
          '',
        ),
      ).toThrowError(
        new HttpException(
          'Invalid request data: UserID missing',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an error if ParentFolderID is missing', async () => {
      const asset = new Asset();
      asset.AssetID = 'test';
      asset.UserID = 1;

      const retrieveAllDTO = new RetrieveAllDTO();
      retrieveAllDTO.UserID = 1;

      jest
        .spyOn(
          assetManagerService,
          'retrieve_all',
        )
        .mockResolvedValue([asset]);

      expect(() =>
        controller.retrieve_all(
          retrieveAllDTO,
          '',
        ),
      ).toThrowError(
        new HttpException(
          'Invalid request data: ParentFolderID missing',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should return an array of AssetDTOs', async () => {
      const asset = new Asset();
      asset.AssetID = 'test';
      asset.UserID = 1;

      const retrieveAllDTO = new RetrieveAllDTO();
      retrieveAllDTO.UserID = 1;
      retrieveAllDTO.ParentFolderID = '';

      jest
        .spyOn(
          assetManagerService,
          'retrieve_all',
        )
        .mockResolvedValue([asset]);

      const response =
        await controller.retrieve_all(
          retrieveAllDTO,
          '',
        );

      expect(response).toEqual([asset]);
      expect(
        assetManagerService.retrieve_all,
      ).toHaveBeenCalledWith(
        retrieveAllDTO,
        false,
      );
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
        await controller.retrieve_one(
          assetDTO,
          '',
        );

      expect(response).toBe(assetDTO);
      expect(
        assetManagerService.retrieve_one,
      ).toHaveBeenCalledWith(assetDTO, false);
    });
  });

  describe('rename_asset', () => {
    it('should return an AssetDTO', async () => {
      const asset = new Asset();
      asset.AssetID = 'test';
      asset.UserID = 1;

      const assetDTO = new AssetDTO();
      assetDTO.AssetID = 'test';
      assetDTO.UserID = 1;

      jest
        .spyOn(
          assetManagerService,
          'rename_asset',
        )
        .mockResolvedValue(asset);

      const response =
        await controller.rename_asset(assetDTO);

      expect(response).toBe(asset);
      expect(
        assetManagerService.rename_asset,
      ).toHaveBeenCalledWith(asset);
    });
  });

  describe('delete_asset', () => {
    it('should return an AssetDTO', async () => {
      const assetDTO = new AssetDTO();
      assetDTO.AssetID = 'test';
      assetDTO.UserID = 1;

      jest
        .spyOn(
          assetManagerService,
          'delete_asset',
        )
        .mockResolvedValue(assetDTO);

      const response =
        await controller.delete_asset(
          assetDTO,
          '',
        );

      expect(response).toBe(assetDTO);
      expect(
        assetManagerService.delete_asset,
      ).toHaveBeenCalledWith(assetDTO, false);
    });
  });
});
