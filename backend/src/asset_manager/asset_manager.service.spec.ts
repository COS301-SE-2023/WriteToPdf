import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { AssetManagerService } from './asset_manager.service';
import { ImageManagerService } from '../image_manager/image_manager.service';
import { AssetsService } from '../assets/assets.service';
import { S3Service } from '../s3/s3.service';
import { TextManagerService } from '../text_manager/text_manager.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Asset } from '../assets/entities/asset.entity';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AssetDTO } from '../assets/dto/asset.dto';
import { RetrieveAllDTO } from './dto/retrieve_all.dto';

describe('AssetManagerService', () => {
  let service: AssetManagerService;
  let textManagerService: TextManagerService;
  let imageManagerService: ImageManagerService;
  let assetsService: AssetsService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
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

    service = module.get<AssetManagerService>(
      AssetManagerService,
    );
    textManagerService =
      module.get<TextManagerService>(
        TextManagerService,
      );
    imageManagerService =
      module.get<ImageManagerService>(
        ImageManagerService,
      );
    assetsService = module.get<AssetsService>(
      AssetsService,
    );
  });

  describe('upload_asset', () => {
    it('should use the text manager service to upload a text asset', async () => {
      const assetDTO = new AssetDTO();
      assetDTO.AssetID = 'test';
      assetDTO.UserID = 1;
      assetDTO.Format = 'text';

      jest
        .spyOn(textManagerService, 'upload')
        .mockResolvedValue(assetDTO);

      const response = await service.upload_asset(
        assetDTO,
      );

      expect(response).toEqual(assetDTO);
      expect(
        textManagerService.upload,
      ).toBeCalledWith(assetDTO);
    });

    it('should use the image manager service to upload an image asset', async () => {
      const assetDTO = new AssetDTO();
      assetDTO.AssetID = 'test';
      assetDTO.UserID = 1;
      assetDTO.Format = 'image';

      jest
        .spyOn(imageManagerService, 'upload')
        .mockResolvedValue(assetDTO);

      const response = await service.upload_asset(
        assetDTO,
      );

      expect(response).toEqual(assetDTO);
      expect(
        imageManagerService.upload,
      ).toBeCalledWith(assetDTO);
    });
  });

  describe('retrieve_all', (/** TDD FTW */) => {
    it('should retrieve all assets from the db', async () => {
      const retrieveAllDTO = new RetrieveAllDTO();
      retrieveAllDTO.UserID = 1;
      retrieveAllDTO.ParentFolderID = 'test';

      const assetDTO = new AssetDTO();
      assetDTO.AssetID = 'test';
      assetDTO.Format = 'image';
      assetDTO.UserID = 1;
      const assets = [assetDTO];

      jest
        .spyOn(assetsService, 'retrieveAllAssets')
        .mockResolvedValue(assets);

      jest
        .spyOn(
          Repository.prototype,
          'createQueryBuilder',
        )
        .mockReturnValue({
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getMany: jest
            .fn()
            .mockResolvedValue([]),
        } as any);

      jest
        .spyOn(
          imageManagerService,
          'retrieveOne',
        )
        .mockResolvedValue(assetDTO);

      jest
        .spyOn(
          assetsService,
          'retrieveOne',
        )

      jest
        .spyOn(
          S3Service.prototype,
          'retrieveAsset',
        )
        .mockResolvedValue(assetDTO);

      jest
        .spyOn(
          imageManagerService,
          'compressImage',
        )
        .mockResolvedValue('Compressed content');

      await service.retrieve_all(
        retrieveAllDTO,
      );

      expect(
        assetsService.retrieveAllAssets,
      ).toBeCalledWith(retrieveAllDTO);

      // expect(
      //   imageManagerService.retrieveOne,
      // ).toBeCalledWith(assetDTO);

      // expect(
      //   imageManagerService.compressImage,
      // ).toBeCalledWith(assetDTO.Content);
    });

    // it('should resize all image assets', async () => {
    //   const retrieveAllDTO = new RetrieveAllDTO();
    //   retrieveAllDTO.UserID = 1;

    //   const assetDTO = new AssetDTO();
    //   assetDTO.AssetID = 'test';
    //   assetDTO.Format = 'image';
    //   assetDTO.UserID = 1;
    //   assetDTO.Content = 'Uncompressed content';

    //   const newAssetDTO = new AssetDTO();
    //   newAssetDTO.AssetID = 'test';
    //   newAssetDTO.UserID = 1;
    //   newAssetDTO.ConvertedElement = '';
    //   newAssetDTO.Image = 'Compressed content';

    //   const assets = [assetDTO];

    //   jest
    //     .spyOn(assetsService, 'retrieveAllAssets')
    //     .mockResolvedValue(assets);

    //   jest
    //     .spyOn(imageManagerService, 'retrieveOne')
    //     .mockResolvedValue(newAssetDTO);

    //   jest
    //     .spyOn(
    //       imageManagerService,
    //       'compressImage',
    //     )
    //     .mockResolvedValue('Compressed content');

    //   const response = await service.retrieve_all(
    //     retrieveAllDTO,
    //   );

    //   expect(response).toEqual([newAssetDTO]);
    //   expect(
    //     imageManagerService.retrieveOne,
    //   ).toBeCalledWith(assetDTO);
    //   expect(
    //     imageManagerService.compressImage,
    //   ).toBeCalledWith(assetDTO.Content);
    // });
  });
});
