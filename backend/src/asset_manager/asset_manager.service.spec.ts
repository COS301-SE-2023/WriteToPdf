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
import { Repository } from 'typeorm/repository/Repository';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AssetDTO } from '../assets/dto/asset.dto';
import { RetrieveAllDTO } from './dto/retrieve_all.dto';
import { text } from 'stream/consumers';

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

  describe('retrieve_all', () => {
    it('should retrieve all assets from the db', async () => {
      const retrieveAllDTO = new RetrieveAllDTO();
      retrieveAllDTO.UserID = 1;
      retrieveAllDTO.ParentFolderID = 'test';

      const imgAsset = new Asset();
      imgAsset.AssetID = 'test';
      imgAsset.Format = 'image';
      imgAsset.UserID = 1;

      const textAsset = new Asset();
      textAsset.AssetID = 'test';
      textAsset.Format = 'text';
      textAsset.UserID = 1;

      const imgAssetDTO = new AssetDTO();
      imgAssetDTO.AssetID = 'test';
      imgAssetDTO.Format = 'image';
      imgAssetDTO.UserID = 1;

      const textAssetDTO = new AssetDTO();
      textAssetDTO.AssetID = 'test';
      textAssetDTO.Format = 'text';
      textAssetDTO.UserID = 1;

      const assets = [imgAsset, textAsset];

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
        .spyOn(imageManagerService, 'retrieveOne')
        .mockResolvedValue(imgAssetDTO);

      jest.spyOn(assetsService, 'retrieveOne');

      jest
        .spyOn(
          S3Service.prototype,
          'retrieveAsset',
        )
        .mockResolvedValue(imgAssetDTO);

      jest
        .spyOn(
          imageManagerService,
          'compressImage',
        )
        .mockResolvedValue('Compressed content');

      jest
        .spyOn(textManagerService, 'retrieveOne')
        .mockResolvedValue(textAssetDTO);

      await service.retrieve_all(retrieveAllDTO);

      expect(
        assetsService.retrieveAllAssets,
      ).toBeCalledWith(retrieveAllDTO);
    });

    describe('retrieve_one', () => {
      it('should retrieve an image asset', async () => {
        const assetDTO = new AssetDTO();
        assetDTO.AssetID = 'test';
        assetDTO.Format = 'image';
        assetDTO.UserID = 1;

        jest
          .spyOn(
            imageManagerService,
            'retrieveOne',
          )
          .mockResolvedValue(assetDTO);

        await service.retrieve_one(assetDTO);

        expect(
          imageManagerService.retrieveOne,
        ).toBeCalledWith(assetDTO);
      });

      it('should retrieve a text asset', async () => {
        const assetDTO = new AssetDTO();
        assetDTO.AssetID = 'test';
        assetDTO.Format = 'text';
        assetDTO.UserID = 1;

        jest
          .spyOn(
            textManagerService,
            'retrieveOne',
          )
          .mockResolvedValue(assetDTO);

        await service.retrieve_one(assetDTO);

        expect(
          textManagerService.retrieveOne,
        ).toBeCalledWith(assetDTO);
      });
    });

    describe('rename_asset', () => {
      it('should rename an image asset', async () => {
        const assetDTO = new AssetDTO();
        assetDTO.AssetID = 'test';
        assetDTO.Format = 'image';
        assetDTO.UserID = 1;

        const asset = new Asset();
        asset.AssetID = 'test';
        asset.Format = 'image';
        asset.UserID = 1;

        jest
          .spyOn(assetsService, 'renameAsset')
          .mockResolvedValue(asset);

        await service.rename_asset(assetDTO);

        expect(
          assetsService.renameAsset,
        ).toBeCalledWith(assetDTO);
      });
    });

    describe('delete_asset', () => {
      it('should delete an asset', async () => {
        const assetDTO = new AssetDTO();
        assetDTO.AssetID = 'test';
        assetDTO.Format = 'image';
        assetDTO.UserID = 1;

        jest.spyOn(assetsService, 'removeOne');

        jest
          .spyOn(Repository.prototype, 'delete')
          .mockResolvedValue(assetDTO as any);

        jest
          .spyOn(
            S3Service.prototype,
            'deleteAsset',
          )
          .mockResolvedValue(assetDTO as any);

        await service.delete_asset(assetDTO);

        expect(
          assetsService.removeOne,
        ).toBeCalledWith(assetDTO.AssetID);

        expect(
          S3Service.prototype.deleteAsset,
        ).toBeCalledWith(assetDTO);
      });
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
