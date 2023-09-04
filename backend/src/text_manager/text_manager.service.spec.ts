import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { TextManagerService } from './text_manager.service';
import { TextractService } from '../textract/textract.service';
import { AssetsService } from '../assets/assets.service';
import { S3Service } from '../s3/s3.service';
import { S3ServiceMock } from '../s3/__mocks__/s3.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from '../assets/entities/asset.entity';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import * as CryptoJS from 'crypto-js';
import { AssetDTO } from '../assets/dto/asset.dto';
import {
  HttpException,
  HttpStatus,
} from '@nestjs/common';

describe('TextManagerService', () => {
  let service: TextManagerService;
  let assetsService: AssetsService;
  let s3Service: S3Service;
  let textractService: TextractService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          TextManagerService,
          AssetsService,
          S3Service,
          S3ServiceMock,
          {
            provide: getRepositoryToken(Asset),
            useClass: Repository,
          },
          AuthService,
          JwtService,
          TextractService,
        ],
      }).compile();

    service = module.get<TextManagerService>(
      TextManagerService,
    );
    assetsService = module.get<AssetsService>(
      AssetsService,
    );
    s3Service = module.get<S3Service>(S3Service);
    textractService = module.get<TextractService>(
      TextractService,
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

      const assetDTO = new AssetDTO();

      jest
        .spyOn(s3Service, 'createAsset')
        .mockResolvedValue(assetDTO);

      jest
        .spyOn(Repository.prototype, 'create')
        .mockReturnValue(assetDTO);

      jest
        .spyOn(Repository.prototype, 'save')
        .mockReturnValue(assetDTO as any);

      jest.spyOn(assetsService, 'saveAsset');

      jest
        .spyOn(service, 'removeBase64Descriptor')
        .mockResolvedValue(
          'mock content' as never,
        );

      jest
        .spyOn(s3Service, 'saveTextAssetImage')
        .mockResolvedValue(assetDTO);

      jest
        .spyOn(textractService, 'extractDocument')
        .mockResolvedValue(
          'mock textract response' as any,
        );

      (
        jest.spyOn(
          service,
          'formatTextractResponse',
        ) as any
      ).mockResolvedValue(
        'mock formatted response',
      );

      jest
        .spyOn(s3Service, 'saveTextractResponse')
        .mockResolvedValue(assetDTO);

      jest
        .spyOn(Buffer, 'from')
        .mockReturnValue('mock buffer' as any);

      const response = await service.upload(
        uploadTextDTO,
      );

      expect(response).toBe(
        'mock formatted response',
      );
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
        .spyOn(s3Service, 'retrieveAssetByID')
        .mockResolvedValue(
          Buffer.from('mock buffer') as any,
        );

      jest
        .spyOn(s3Service, 'retrieveAssetByID')
        .mockResolvedValue(
          '{textract: response}',
        );

      const response = await service.retrieveOne(
        retrieveTextDTO,
      );

      expect(response.Image).toBe(
        '{textract: response}',
      );
    });

    it('should throw error if asset not found', async () => {
      const retrieveTextDTO = new AssetDTO();
      retrieveTextDTO.AssetID = 'mock asset id';
      retrieveTextDTO.Format = 'text';
      retrieveTextDTO.Content = 'mock content';
      jest
        .spyOn(Repository.prototype, 'findOne')
        .mockReturnValue(null);

      jest
        .spyOn(assetsService, 'retrieveOne')
        .mockReturnValue(null);
      try {
        const response =
          await service.retrieveOne(
            retrieveTextDTO,
          );
        expect(true).toBe(false);
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
  });

  describe('removeBase64Descriptor', () => {
    it('should remove base64 descriptor', async () => {
      const response =
        await service.removeBase64Descriptor(
          'data:image/jpeg;base64,mock base64 string',
        );
      expect(response).toBe('mock base64 string');
    });
  });

  describe('prependBase64Descriptor', () => {
    it('should prepend base64 descriptor', async () => {
      const response =
        await service.prependBase64Descriptor(
          'mock base64 string',
        );
      expect(response).toBe(
        'data:image/jpeg;base64,mock base64 string',
      );
    });
  });

  // describe('parseS3Content', () => {
  //   it('should parse s3 content', async () => {
  //     const assetDTO = new AssetDTO();
  //     assetDTO.Content = '1\na<base64 string>';
  //     const response =
  //       await service.parseS3Content(assetDTO);
  //     expect(response.Image).toBe(
  //       '<base64 string>',
  //     );
  //     expect(response.Content).toBe('a');
  //   });
  // });
});
