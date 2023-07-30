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
import { RetrieveAllDTO } from '../src/asset_manager/dto/retrieve_all.dto';

let assetID = '';

enum ResetScope {
  ALL,
  ASSETS,
  NONE,
}

describe('AssetManager (integration)', () => {
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
          `SELECT * FROM ASSETS WHERE UserID = ?`,
          [process.env.TEST_USERID],
        );

      for (const asset of testUserAssets) {
        await s3Service.deleteAsset(asset);
      }

      await assetRepository.query(
        `DELETE FROM ASSETS WHERE UserID = ?`,
        [process.env.TEST_USERID],
      );

      const testAsset = new Asset();
      testAsset.AssetID = 'Test Asset';
      testAsset.TextID = 'TextID';
      testAsset.UserID = parseInt(
        process.env.TEST_USERID,
      );
      testAsset.FileName = 'Test Asset';
      testAsset.Format = 'text';
      testAsset.ParentFolderID = '';
      testAsset.Image = 'Test Image';
      testAsset.Size = 0;

      const testAssetDTO = new AssetDTO();
      testAssetDTO.AssetID = 'Test Asset';
      testAssetDTO.TextID = 'TextID';
      testAssetDTO.UserID = parseInt(
        process.env.TEST_USERID,
      );
      testAssetDTO.FileName = 'Test Asset';
      testAssetDTO.Format = 'text';
      testAssetDTO.ParentFolderID = '';
      testAssetDTO.Content = 'Test Asset Content';
      testAssetDTO.Image = 'Test Image';
      testAssetDTO.Size = 0;

      assetID = testAsset.AssetID;

      await s3Service.saveAsset(testAssetDTO);
      //   await assetRepository.save(testAsset);
      await assetRepository.query(
        `INSERT INTO ASSETS (AssetID, TextID, UserID, FileName, Format, ParentFolderID, Image, Size) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          testAsset.AssetID,
          testAsset.TextID,
          testAsset.UserID,
          testAsset.FileName,
          testAsset.Format,
          testAsset.ParentFolderID,
          testAsset.Image,
          testAsset.Size,
        ],
      );
    }
  }

  describe('asset_manager endpoint', () => {
    // it('should be mocked out', async () => {
    //   await resetUser(ResetScope.ASSETS);
    //   expect(true).toBe(true);
    // });

    describe('upload_asset', () => {
      it('/asset_manager/upload_asset (POST) - missing UserID', async () => {
        await resetUser(ResetScope.NONE);

        const assetDTO = new AssetDTO();
        assetDTO.AssetID = 'New Asset';
        assetDTO.FileName = 'Test Asset';
        assetDTO.Format = 'text';
        assetDTO.ParentFolderID = '';

        const response = await request(
          app.getHttpServer(),
        )
          .post('/asset_manager/upload_asset')
          .set(
            'Authorization',
            'Bearer ' + process.env.AUTH_BEARER,
          )
          .set('isTest', 'true')
          .send(assetDTO);

        expect(response.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toHaveProperty(
          'statusCode',
        );
        expect(response.body).toHaveProperty(
          'message',
        );
        expect(response.body.statusCode).toEqual(
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body.message).toEqual(
          'Invalid request data: UserID missing',
        );
      });

      it('/asset_manager/upload_asset (POST) - missing ParentFolderID', async () => {
        await resetUser(ResetScope.NONE);

        const assetDTO = new AssetDTO();
        assetDTO.AssetID = 'New Asset';
        assetDTO.UserID = parseInt(
          process.env.TEST_USERID,
        );
        assetDTO.FileName = 'Test Asset';
        assetDTO.Format = 'text';

        const response = await request(
          app.getHttpServer(),
        )
          .post('/asset_manager/upload_asset')
          .set(
            'Authorization',
            'Bearer ' + process.env.AUTH_BEARER,
          )
          .set('isTest', 'true')
          .send(assetDTO);

        expect(response.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toHaveProperty(
          'statusCode',
        );
        expect(response.body).toHaveProperty(
          'message',
        );
        expect(response.body.statusCode).toEqual(
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body.message).toEqual(
          'Invalid request data: ParentFolderID missing',
        );
      });

      it('/asset_manager/upload_asset (POST) - valid request', async () => {
        await resetUser(ResetScope.ASSETS);
        const assetDTO = new AssetDTO();
        assetDTO.AssetID = 'New Asset';
        assetDTO.TextID = 'TextID';
        assetDTO.UserID = parseInt(
          process.env.TEST_USERID,
        );
        assetDTO.FileName = 'New Asset';
        assetDTO.Format = 'text';
        assetDTO.ParentFolderID = '';

        const response = await request(
          app.getHttpServer(),
        )
          .post('/asset_manager/upload_asset')
          .set(
            'Authorization',
            'Bearer ' + process.env.AUTH_BEARER,
          )
          .set('isTest', 'true')
          .send(assetDTO);

        expect(response.status).toBe(201);

        expect(response.body).toHaveProperty(
          'AssetID',
        );
        expect(response.body).toHaveProperty(
          'TextID',
        );
        expect(response.body).toHaveProperty(
          'UserID',
        );
        expect(response.body).toHaveProperty(
          'FileName',
        );
        expect(response.body).toHaveProperty(
          'Format',
        );
        expect(response.body).toHaveProperty(
          'ParentFolderID',
        );

        expect(response.body.AssetID).not.toEqual(
          assetDTO.AssetID,
        );
        expect(response.body.TextID).toEqual(
          assetDTO.TextID,
        );
        expect(response.body.UserID).toEqual(
          assetDTO.UserID,
        );
        expect(response.body.FileName).toEqual(
          assetDTO.FileName,
        );
      });
    });

    describe('retrieve_all', () => {
      it('/asset_manager/retrieve_all (POST) - missing UserID', async () => {
        await resetUser(ResetScope.NONE);

        const requestDTO = new RetrieveAllDTO();
        requestDTO.ParentFolderID = '';

        const response = await request(
          app.getHttpServer(),
        )
          .post('/asset_manager/retrieve_all')
          .set(
            'Authorization',
            'Bearer ' + process.env.AUTH_BEARER,
          )
          .set('isTest', 'true')
          .send(requestDTO);

        expect(response.status).toBe(
          HttpStatus.BAD_REQUEST,
        );

        expect(response.body).toHaveProperty(
          'statusCode',
        );
        expect(response.body).toHaveProperty(
          'message',
        );
        expect(response.body.statusCode).toEqual(
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body.message).toEqual(
          'Invalid request data: UserID missing',
        );
      });

      it('/asset_manager/retrieve_all (POST) - missing ParentFolderID', async () => {
        await resetUser(ResetScope.NONE);

        const requestDTO = new RetrieveAllDTO();
        requestDTO.UserID = parseInt(
          process.env.TEST_USERID,
        );

        const response = await request(
          app.getHttpServer(),
        )
          .post('/asset_manager/retrieve_all')
          .set(
            'Authorization',
            'Bearer ' + process.env.AUTH_BEARER,
          )
          .set('isTest', 'true')
          .send(requestDTO);

        expect(response.status).toBe(
          HttpStatus.BAD_REQUEST,
        );

        expect(response.body).toHaveProperty(
          'statusCode',
        );
        expect(response.body).toHaveProperty(
          'message',
        );
        expect(response.body.statusCode).toEqual(
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body.message).toEqual(
          'Invalid request data: ParentFolderID missing',
        );
      });

      it('/asset_manager/retrieve_all (POST) - valid request', async () => {
        await resetUser(ResetScope.ASSETS);

        const requestDTO = new RetrieveAllDTO();
        requestDTO.UserID = parseInt(
          process.env.TEST_USERID,
        );
        requestDTO.ParentFolderID = '';

        const response = await request(
          app.getHttpServer(),
        )
          .post('/asset_manager/retrieve_all')
          .set(
            'Authorization',
            'Bearer ' + process.env.AUTH_BEARER,
          )
          .set('isTest', 'true')
          .send(requestDTO);

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(
          Array,
        );
        expect(response.body.length).toBe(1);
        expect(response.body[0]).toHaveProperty(
          'AssetID',
        );
      });
    });

    describe('retrieve_one', () => {
      it('/asset_manager/retrieve_one (POST) - valid request', async () => {
        await resetUser(ResetScope.ASSETS);

        const requestDTO = new AssetDTO();
        requestDTO.AssetID = 'Test Asset';
        requestDTO.TextID = 'Test TextID';
        requestDTO.UserID = parseInt(
          process.env.TEST_USERID,
        );
        requestDTO.Format = 'text';

        const response = await request(
          app.getHttpServer(),
        )
          .post('/asset_manager/retrieve_one')
          .set(
            'Authorization',
            'Bearer ' + process.env.AUTH_BEARER,
          )
          .set('isTest', 'true')
          .send(requestDTO);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty(
          'Image',
        );
        expect(response.body).toHaveProperty(
          'Size',
        );

        expect(response.body.Image).toEqual(
          'Test Asset Content',
        );
        expect(response.body.Size).not.toEqual(0);
      });
    });

    describe('rename_asset', () => {
      it('/asset_manager/rename_asset (POST) - valid request', async () => {
        await resetUser(ResetScope.ASSETS);

        const requestDTO = new AssetDTO();
        requestDTO.AssetID = 'Test Asset';
        requestDTO.TextID = 'Test TextID';
        requestDTO.UserID = parseInt(
          process.env.TEST_USERID,
        );
        requestDTO.Format = 'text';
        requestDTO.FileName = 'New Asset Name';

        const response = await request(
          app.getHttpServer(),
        )
          .post('/asset_manager/rename_asset')
          .set(
            'Authorization',
            'Bearer ' + process.env.AUTH_BEARER,
          )
          .set('isTest', 'true')
          .send(requestDTO);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty(
          'FileName',
        );

        expect(response.body.FileName).toEqual(
          'New Asset Name',
        );
      });
    });

    describe('delete_asset', () => {
      it('/asset_manager/delete_asset (POST) - valid request', async () => {
        await resetUser(ResetScope.ASSETS);

        const requestDTO = new AssetDTO();
        requestDTO.AssetID = 'Test Asset';
        requestDTO.TextID = 'Test TextID';
        requestDTO.UserID = parseInt(
          process.env.TEST_USERID,
        );
        requestDTO.Format = 'text';

        const response = await request(
          app.getHttpServer(),
        )
          .post('/asset_manager/delete_asset')
          .set(
            'Authorization',
            'Bearer ' + process.env.AUTH_BEARER,
          )
          .set('isTest', 'true')
          .send(requestDTO);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty(
          'AssetID',
        );
        expect(response.body).toHaveProperty(
          'TextID',
        );

        expect(response.body.AssetID).toEqual(
          'Test Asset',
        );
        expect(response.body.TextID).toEqual(
          'Test TextID',
        );
      });
    });
  });
});
