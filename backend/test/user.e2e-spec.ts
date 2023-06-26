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
import { UserDTO } from '../src/users/dto/user.dto';
import * as dotenv from 'dotenv';

describe('UserController (integration)', () => {
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

  describe('users endpoint', () => {
    it('/users/login/ (GET)', async () => {
      // jest.setTimeout(10000);
      return await request(app.getHttpServer())
        .get('/users/login/')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('/users/login/ (POST)', async () => {
      const requestUser = new UserDTO();
      requestUser.Email = process.env.TEST_EMAIL;
      requestUser.Password =
        process.env.TEST_PASSWORD;

      const response = await request(
        app.getHttpServer(),
      )
        .post('/users/login/')
        .send(requestUser);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty(
        'Token',
      );
      expect(response.body).toHaveProperty(
        'Email',
      );
    });
  });

  it('/users/login/ (POST) - incorrect password', async () => {
    const requestUser = new UserDTO();
    requestUser.Email = process.env.TEST_EMAIL; // correct credential
    requestUser.Password = 'incorrectPassword'; // incorrect credential

    const response = await request(
      app.getHttpServer(),
    )
      .post('/users/login/')
      .send(requestUser);
    expect(response.status).toBe(
      HttpStatus.UNAUTHORIZED,
    );
    expect(response.body.error).toBe(
      'Incorrect password',
    );
  });
});
