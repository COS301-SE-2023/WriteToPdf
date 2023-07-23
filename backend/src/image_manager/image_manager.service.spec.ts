import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { ImageManagerService } from './image_manager.service';
import { S3Service } from '../s3/s3.service';
import { AssetsService } from '../assets/assets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Asset } from '../assets/entities/asset.entity';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';

describe('ImageManagerService', () => {
  let service: ImageManagerService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          ImageManagerService,
          S3Service,
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
