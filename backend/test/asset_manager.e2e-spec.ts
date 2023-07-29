import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import {
  HttpStatus,
  INestApplication,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as dotenv from 'dotenv';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { S3ServiceMock } from '../src/s3/__mocks__/s3.service';
import { Asset } from '../src/assets/entities/asset.entity';
import { AssetDTO } from '../src/assets/dto/asset.dto';

let assetID = '';

enum ResetScope {
  ALL,
  ASSETS,
  NONE,
}

describe('FileManagerController (integration)', () => {
  let app: INestApplication;
  let assetRepository: Repository<Asset>;
  let s3Service: S3ServiceMock;

  beforeAll(async () => {
    dotenv.config({ path: '.env.test' });
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
        providers: [
          {
            provide: getRepositoryToken(Asset),
            useClass: Repository,
          },
        ],
      }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    assetRepository = moduleFixture.get<
      Repository<Asset>
    >(getRepositoryToken(Asset));
    s3Service = new S3ServiceMock();

    await resetUser(ResetScope.ALL);
  });

  afterAll(async () => {
    await app.close();
  });

  async function resetUser(
    resetScope: ResetScope,
  ) {
    if (
      resetScope === ResetScope.ALL ||
      resetScope === ResetScope.ASSETS
    ) {
      const testUserAssets =
        await assetRepository.query(
          `SELECT * FROM ASSET WHERE UserID = ?`,
          [process.env.TEST_USERID],
        );

      for (const asset of testUserAssets) {
        await assetRepository.delete(asset);
        await s3Service.deleteAsset(asset);
      }

      const testAsset = new Asset();
      testAsset.AssetID = 'Test Asset';
      testAsset.UserID = parseInt(
        process.env.TEST_USERID,
      );
      testAsset.FileName = 'Test Asset';
      testAsset.Format = 'text';
      testAsset.ParentFolderID = '';

      const testAssetDTO = new AssetDTO();
      testAssetDTO.AssetID = 'Test Asset';
      testAssetDTO.UserID = parseInt(
        process.env.TEST_USERID,
      );
      testAssetDTO.FileName = 'Test Asset';
      testAssetDTO.Format = 'text';
      testAssetDTO.ParentFolderID = '';

      assetID = testAsset.AssetID;

      await s3Service.saveAsset(testAssetDTO);
      await assetRepository.save(testAsset);
    }
  }
});
