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

describe('AssetManagerService', () => {
  let service: AssetManagerService;
  let textManagerService: TextManagerService;
  let imageManagerService: ImageManagerService;

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
});
