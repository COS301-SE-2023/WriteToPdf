import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import {
  HttpStatus,
  INestApplication,
  Module,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MarkdownFileDTO } from '../src/markdown_files/dto/markdown_file.dto';
import { FolderDTO } from '../src/folders/dto/folder.dto';
import { DirectoryFoldersDTO } from '../src/file_manager/dto/directory_folders.dto';
import { DirectoryFilesDTO } from '../src/file_manager/dto/directory_files.dto';
import * as dotenv from 'dotenv';
// import { DataSource } from 'typeorm';
import { dataSource } from '../db/data-source';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MarkdownFile } from '../src/markdown_files/entities/markdown_file.entity';
let startTime: string;

describe('FileManagerController (integration)', () => {
  let app: INestApplication;
  let markdownFileRepository: Repository<MarkdownFile>;

  beforeAll(async () => {
    dotenv.config({ path: '.env.test' });
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
        providers: [
          {
            provide:
              getRepositoryToken(MarkdownFile),
            useClass: Repository,
          },
        ],
      }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    markdownFileRepository = moduleFixture.get<
      Repository<MarkdownFile>
    >(getRepositoryToken(MarkdownFile));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const currentTime = new Date();
    const twoHoursLater = new Date(
      currentTime.getTime() + 2 * 60 * 60 * 1000,
    );
    startTime = twoHoursLater.toISOString();
  });

  afterEach(async () => {
    await cleanUp();
  });

  async function cleanUp() {
    // console.log(
    //   'expect.getState().currentTestName: ',
    //   expect.getState().currentTestName,
    // );
    switch (expect.getState().currentTestName) {
      case 'FileManagerController (integration) file-manager endpoint /file-manager/create_file/ (POST) - valid request':
        await markdownFileRepository.query(
          'DELETE FROM MARKDOWN_FILES WHERE UserID = ? AND LastModified > ?',
          [process.env.TEST_USERID, startTime],
        );
        break;
    }
  }

  describe('file-manager endpoint', () => {
    it('/file-manager/create_file/ (POST) - missing UserID', async () => {
      const requestMarkdownFileDTO =
        new MarkdownFileDTO();

      const response = await request(
        app.getHttpServer(),
      )
        .post('/file_manager/create_file/')
        .set(
          'Authorization',
          'Bearer ' + process.env.AUTH_BEARER,
        )
        .send(requestMarkdownFileDTO);

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
        'Invalid request data',
      );
    });

    it('/file-manager/create_file/ (POST) - valid request', async () => {
      const requestMarkdownFileDTO =
        new MarkdownFileDTO();
      requestMarkdownFileDTO.UserID = 6;

      const response = await request(
        app.getHttpServer(),
      )
        .post('/file_manager/create_file/')
        .set(
          'Authorization',
          'Bearer ' + process.env.AUTH_BEARER,
        )
        .send(requestMarkdownFileDTO);

      expect(response.body).toHaveProperty(
        'MarkdownID',
      );
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty(
        'Name',
      );
      expect(response.body).toHaveProperty(
        'Content',
      );
      expect(response.body).toHaveProperty(
        'Path',
      );
      expect(response.body).toHaveProperty(
        'DateCreated',
      );
      expect(response.body).toHaveProperty(
        'LastModified',
      );
      expect(response.body).toHaveProperty(
        'Size',
      );
      expect(response.body).toHaveProperty(
        'ParentFolderID',
      );
      expect(response.body).toHaveProperty(
        'UserID',
      );
      expect(response.body.Name).toEqual(
        'New Document',
      );
      expect(response.body.Path).toEqual('');
      expect(
        response.body.ParentFolderID,
      ).toEqual('');
    });
  });
});
