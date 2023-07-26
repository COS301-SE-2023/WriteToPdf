import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { TextManagerService } from './text_manager.service';
import { AssetsService } from '../assets/assets.service';
import { S3Service } from '../s3/s3.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from '../assets/entities/asset.entity';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import * as CryptoJS from 'crypto-js';
import { AssetDTO } from '../assets/dto/asset.dto';

describe('TextManagerService', () => {
  let service: TextManagerService;
  let assetsService: AssetsService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          TextManagerService,
          AssetsService,
          S3Service,
          {
            provide: getRepositoryToken(Asset),
            useClass: Repository,
          },
          AuthService,
          JwtService,
        ],
      }).compile();

    service = module.get<TextManagerService>(
      TextManagerService,
    );
    assetsService = module.get<AssetsService>(
      AssetsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upload', () => {
    it('should upload asset', async () => {
      jest
        .spyOn(CryptoJS, 'SHA256')
        .mockResolvedValue(
          'mock sha256 hash string',
        );

      const uploadTextDTO = new AssetDTO();
      uploadTextDTO.UserID = 1;
      // .ConvertedElement left undefined
      // .Content left undefined

      const assetDTO = new AssetDTO();

      jest
        .spyOn(Repository.prototype, 'create')
        .mockReturnValue(assetDTO);

      jest
        .spyOn(Repository.prototype, 'save')
        .mockReturnValue(assetDTO as any);

      jest.spyOn(assetsService, 'saveAsset');

      const response = await service.upload(
        uploadTextDTO,
      );

      expect(response).toBe(uploadTextDTO);
    });
  });

  describe('retrieveOne', () => {
    it('should retrieve asset', async () => {
      const retrieveTextDTO = new AssetDTO();
      retrieveTextDTO.AssetID = 'mock asset id';
      retrieveTextDTO.Format = 'text';
      retrieveTextDTO.Content = 'mock content';

      const assetDTO = new AssetDTO();

      jest
        .spyOn(Repository.prototype, 'findOne')
        .mockReturnValue(assetDTO as any);

      jest
        .spyOn(assetsService, 'retrieveOne')
        .mockReturnValue(assetDTO as any);

      jest
        .spyOn(service, 'parseS3Content')
        .mockReturnValue(assetDTO as any);

      const response = await service.retrieveOne(
        retrieveTextDTO,
      );

      expect(response).toBe(assetDTO);
    });
  });
});
