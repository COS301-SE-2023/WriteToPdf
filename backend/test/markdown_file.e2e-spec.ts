import {
  HttpStatus,
  INestApplication,
} from '@nestjs/common';
import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { MarkdownFileDTO } from '../src/markdown_files/dto/markdown_file.dto';
import 'dotenv/config';

describe('Markdown File Controller (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
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

  describe('Create markdown file (POST)', () => {
    it('should create a new markdown file', async () => {
      const createMarkdownFileDTO: MarkdownFileDTO =
        {
          MarkdownID: 'abc123efg',
          Name: 'mdfile_E2E_Test',
          Content: 'lorem ipsum',
          Path: '',
          DateCreated: undefined,
          LastModified: undefined,
          Size: 0,
          ParentFolderID: '',
          UserID: 1,
        };

      const response = await request(
        app.getHttpServer(),
      )
        .post('/markdown-files/')
        .send(createMarkdownFileDTO)
        .set(
          'Authorization',
          `Bearer ${process.env.AUTH_BEARER}`,
        );

      expect(response.status).toBe(
        HttpStatus.CREATED,
      );
      expect(response.body.MarkdownID).toEqual(
        createMarkdownFileDTO.MarkdownID,
      );
      expect(response.body.UserID).toEqual(
        createMarkdownFileDTO.UserID,
      );
    });
  });

  describe('Delete markdown file (DELETE)', () => {
    it('should delete a markdown file', async () => {
      const BEARER = process.env.AUTH_BEARER;
      const response = await request(
        app.getHttpServer(),
      )
        .delete('/markdown-files/:MarkdownID')
        .send({ MarkdownID: 'abc123efg' })
        .set('Authorization', `Bearer ${BEARER}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.affected).toEqual(1);
    });

    it('should not delete a file if MarkdownID not present in db', async () => {
      const response = await request(
        app.getHttpServer(),
      )
        .delete('/markdown-files/:MarkdownID')
        .send({
          MarkdownID: 'non-existent MarkdownID',
        })
        .set(
          'Authorization',
          `Bearer ${process.env.AUTH_BEARER}`,
        );

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.affected).toEqual(0);
    });
  });
});
