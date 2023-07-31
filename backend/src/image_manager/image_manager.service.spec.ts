import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { ImageManagerService } from './image_manager.service';
import { S3Service } from '../s3/s3.service';
import { S3ServiceMock } from '../s3/__mocks__/s3.service';
import { AssetsService } from '../assets/assets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Asset } from '../assets/entities/asset.entity';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AssetDTO } from '../assets/dto/asset.dto';
import * as CryptoJS from 'crypto-js';
import {
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RetrieveAllDTO } from '../asset_manager/dto/retrieve_all.dto';
import * as sharp from 'sharp';

jest.mock('crypto-js', () => {
  const mockedHash = jest.fn(
    () => 'hashed string',
  );

  return {
    SHA256: jest.fn().mockReturnValue({
      toString: mockedHash,
    }),
  };
});
describe('ImageManagerService', () => {
  let service: ImageManagerService;
  let assetsService: AssetsService;
  let s3Service: S3Service;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          ImageManagerService,
          S3Service,
          S3ServiceMock,
          AssetsService,
          {
            provide: getRepositoryToken(Asset),
            useClass: Repository,
          },
          AuthService,
          JwtService,
        ],
      }).compile();

    service = module.get<ImageManagerService>(
      ImageManagerService,
    );
    assetsService = module.get<AssetsService>(
      AssetsService,
    );
    s3Service = module.get<S3Service>(S3Service);
  });

  describe('upload', () => {
    it('should set undefined values to empty strings', async () => {
      const uploadImage = new AssetDTO();
      uploadImage.Image = 'test';
      uploadImage.UserID = 1;

      jest
        .spyOn(assetsService, 'saveAsset')
        .mockResolvedValue(new Asset());
      // .mockResolvedValue(uploadImage);

      jest
        .spyOn(s3Service, 'saveImageAsset')
        .mockImplementation((assetDTO) =>
          Promise.resolve(assetDTO),
        );

      // expect(
      //   uploadImage.ConvertedElement,
      // ).toBeUndefined();
      expect(uploadImage.Content).toBeUndefined();

      const result = await service.upload(
        uploadImage,
      );

      expect(result.Content).toEqual('test');
    });

    it('should store the image in the db and s3', async () => {
      const uploadAssetWithImage = new AssetDTO();
      uploadAssetWithImage.Image = 'test';
      uploadAssetWithImage.UserID = 1;
      uploadAssetWithImage.AssetID = 'test';

      const asset = new Asset();
      asset.Image = 'test';
      asset.UserID = 1;
      asset.AssetID = 'test';

      jest
        .spyOn(assetsService, 'saveAsset')
        .mockResolvedValue(asset);
      // .mockResolvedValue(uploadAssetWithImage);

      jest
        .spyOn(s3Service, 'saveImageAsset')
        .mockImplementation((assetDTO) =>
          Promise.resolve(assetDTO),
        );

      const result = await service.upload(
        uploadAssetWithImage,
      );

      expect(result).toEqual(
        uploadAssetWithImage,
      );
      expect(
        assetsService.saveAsset,
      ).toBeCalled();
      expect(
        s3Service.saveImageAsset,
      ).toBeCalled();
      expect(CryptoJS.SHA256).toBeCalled();
    });
  });

  describe('retrieveAll', () => {
    it('should retrieve all assets', () => {
      const retrieveAllDTO = new RetrieveAllDTO();

      const asset = new Asset();

      jest
        .spyOn(assetsService, 'retrieveAllAssets')
        .mockResolvedValue([asset]);

      const response = service.retrieveAll(
        retrieveAllDTO,
      );

      expect(
        assetsService.retrieveAllAssets,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('retrieveOne', () => {
    it('should throw error if asset not in db', async () => {
      const retrieveAssetDTO: AssetDTO =
        new AssetDTO();

      retrieveAssetDTO.AssetID = '1';
      retrieveAssetDTO.Format = 'text';

      jest
        .spyOn(assetsService, 'retrieveOne')
        .mockResolvedValue(null);

      try {
        await service.retrieveOne(
          retrieveAssetDTO,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Asset not found, check AssetID and Format',
        );
        expect(error.status).toBe(
          HttpStatus.NOT_FOUND,
        );
      }
    });

    it('should return content of specified asset', async () => {
      const retrieveAssetDTO = new AssetDTO();

      retrieveAssetDTO.AssetID = '1';
      retrieveAssetDTO.Format = 'text';

      jest
        .spyOn(assetsService, 'retrieveOne')
        .mockResolvedValue(new Asset());

      jest
        .spyOn(s3Service, 'retrieveAsset')
        .mockResolvedValue(retrieveAssetDTO);

      await service.retrieveOne(retrieveAssetDTO);

      expect(
        s3Service.retrieveAsset,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteAsset', () => {
    it('should remove specified asset', () => {
      const assetDTO = new AssetDTO();
      jest
        .spyOn(assetsService, 'removeOne')
        .mockResolvedValue(assetDTO as any);
      jest
        .spyOn(Repository.prototype, 'create')
        .mockReturnValue(assetDTO);
      jest
        .spyOn(s3Service, 'deleteAsset')
        .mockResolvedValue(assetDTO);

      const response =
        service.deleteAsset(assetDTO);

      expect(
        assetsService.removeOne,
      ).toHaveBeenCalled();

      expect(
        s3Service.deleteAsset,
      ).toHaveBeenCalled();
    });
  });

  describe('renameAsset', () => {
    it('should rename specified asset', () => {
      jest
        .spyOn(assetsService, 'renameAsset')
        .mockResolvedValue(new Asset());

      const response = service.renameAsset(
        new AssetDTO(),
      );

      expect(
        assetsService.renameAsset,
      ).toHaveBeenCalled();
    });
  });

  describe('compressImage', () => {
    it('should compress an image given a base64 string', async () => {
      jest.mock('sharp', () => ({
        __esModule: true,
        default: jest.fn((imageBuffer) => ({
          resize: jest.fn().mockReturnThis(),
          toFormat: jest.fn().mockReturnThis(),
          toBuffer: jest
            .fn()
            .mockResolvedValue(imageBuffer), // Mock the sharp function to return the input buffer as-is
        })),
      }));

      const base64Buffer = await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 4, // 4 channels for RGBA
          background: {
            r: 253,
            g: 201,
            b: 123,
            alpha: 1,
          }, // White background
        },
      })
        .jpeg()
        .toBuffer();

      const base64String =
        base64Buffer.toString('base64');

      jest.spyOn;

      const thumbnail =
        await service.compressImage(base64String);

      expect(typeof thumbnail).toBe('string');

      // Assert that the return value is a valid base64 string
      expect(thumbnail).toMatch(
        /^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/,
      );
    });
  });
});
