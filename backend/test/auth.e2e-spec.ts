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
import { RefreshTokenDTO } from '../src/auth/dto/refresh_token.dto';
import * as dotenv from 'dotenv';

describe('AuthController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    dotenv.config({ path: '.env.test' });
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('auth endpoint', () => {
    it('/auth/refresh_token/ (POST) - invalid token', async () => {
      const requestRefreshToken =
        new RefreshTokenDTO();
      requestRefreshToken.Token = 'InvalidToken';
      requestRefreshToken.UserID = 123;

      const response = await request(
        app.getHttpServer(),
      )
        .post('/auth/refresh_token/')
        .set(
          'Authorization',
          'Bearer ' + process.env.AUTH_BEARER,
        )
        .send(requestRefreshToken);

      expect(response.status).toBe(
        HttpStatus.UNAUTHORIZED,
      );
      expect(response.body).toHaveProperty(
        'message',
      );
      expect(response.body.message).toEqual(
        'Invalid token',
      );
    });

    it('/auth/refresh_token/ (POST) - valid credentials', async () => {
      const requestRefreshToken =
        new RefreshTokenDTO();
      requestRefreshToken.Token =
        process.env.AUTH_BEARER;
      requestRefreshToken.UserID = parseInt(
        process.env.TEST_USERID,
      );

      const response = await request(
        app.getHttpServer(),
      )
        .post('/auth/refresh_token/')
        .set(
          'Authorization',
          'Bearer ' + process.env.AUTH_BEARER,
        )
        .send(requestRefreshToken);

      expect(response.body).toHaveProperty(
        'Token',
      );
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty(
        'UserID',
      );
      expect(response.body.Token).not.toEqual(
        requestRefreshToken.Token,
      );
      expect(response.body.UserID).toEqual(
        requestRefreshToken.UserID,
      );
    });
  });
});
