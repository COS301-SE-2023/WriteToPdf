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
import exp from 'constants';

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
    it('/auth/login/ (POST) - invalid token', async () => {
      const requestRefreshToken =
        new RefreshTokenDTO();
      requestRefreshToken.Email =
        process.env.TEST_EMAIL;
      requestRefreshToken.Token = 'InvalidToken';
      requestRefreshToken.ExpiresAt = new Date();
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
      requestRefreshToken.Email =
        process.env.TEST_EMAIL;
      requestRefreshToken.Token =
        process.env.AUTH_BEARER;
      requestRefreshToken.ExpiresAt = new Date();
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

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty(
        'Token',
      );
      expect(response.body).toHaveProperty(
        'Email',
      );
      expect(response.body).toHaveProperty(
        'ExpiresAt',
      );
      expect(response.body).toHaveProperty(
        'UserID',
      );
      expect(response.body.Token).not.toEqual(
        requestRefreshToken.Token,
      );
      expect(response.body.Email).toEqual(
        requestRefreshToken.Email,
      );
      expect(response.body.ExpiresAt).not.toEqual(
        requestRefreshToken.ExpiresAt,
      );
      expect(response.body.UserID).toEqual(
        requestRefreshToken.UserID,
      );
    });
  });
});
