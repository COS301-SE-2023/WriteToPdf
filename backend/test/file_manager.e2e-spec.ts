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
import { S3Service } from '../src/s3/s3.service';
import { FileDTO } from '../src/s3/dto/file.dto';

let startTime: string;
let fileID: string;
const DELETE_MARKDOWN_ID = '1';

describe('FileManagerController (integration)', () => {
  let app: INestApplication;
  let markdownFileRepository: Repository<MarkdownFile>;
  let s3Service: S3Service;

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
    s3Service =
      moduleFixture.get<S3Service>(S3Service);
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
    console.log(
      'expect.getState().currentTestName: ',
      expect.getState().currentTestName,
    );
    switch (expect.getState().currentTestName) {
      case 'FileManagerController (integration) file-manager endpoint create_file /file-manager/create_file/ (POST) - valid request':
        await markdownFileRepository.query(
          'DELETE FROM MARKDOWN_FILES WHERE MarkdownID = ? AND UserID = ?',
          [fileID, process.env.TEST_USERID],
        );
        const fileDTO = new MarkdownFileDTO();
        fileDTO.UserID = parseInt(
          process.env.TEST_USERID,
        );
        fileDTO.Path = '';
        fileDTO.MarkdownID = fileID;
        await s3Service.deleteFile(fileDTO);
        break;

      case 'FileManagerController (integration) file-manager endpoint /file-manager/delete_file/ (POST) - valid request':
        console.log('Cleaning up delete');
        await markdownFileRepository.query(
          'INSERT INTO MARKDOWN_FILES (MarkdownID, Name, Path, Size, ParentFolderID, UserID) VALUES (?, ?, ?, ?, ?, ?)',
          [
            DELETE_MARKDOWN_ID,
            'Test Delete',
            '',
            0,
            '',
            process.env.TEST_USERID,
          ],
        );
        break;
    }
  }

  describe('file-manager endpoint', () => {
    describe('create_file', () => {
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
        fileID = response.body.MarkdownID;
        expect(response.status).toBe(
          HttpStatus.OK,
        );
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

    // describe('delete_file', () => {
    //   it('/file-manager/delete_file/ (POST) - missing UserID', async () => {
    //     const requestMarkdownFileDTO =
    //       new MarkdownFileDTO();
    //     requestMarkdownFileDTO.MarkdownID =
    //       DELETE_MARKDOWN_ID;

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/delete_file/')
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestMarkdownFileDTO);

    //     expect(response.status).toBe(
    //       HttpStatus.BAD_REQUEST,
    //     );
    //     expect(response.body).toHaveProperty(
    //       'statusCode',
    //     );
    //     expect(response.body).toHaveProperty(
    //       'message',
    //     );
    //     expect(response.body.statusCode).toEqual(
    //       HttpStatus.BAD_REQUEST,
    //     );
    //     expect(response.body.message).toEqual(
    //       'Invalid request data',
    //     );
    //   });

    //   it('/file-manager/delete_file/ (POST) - missing MarkdownID', async () => {
    //     const requestMarkdownFileDTO =
    //       new MarkdownFileDTO();
    //     requestMarkdownFileDTO.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/delete_file/')
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestMarkdownFileDTO);

    //     expect(response.status).toBe(
    //       HttpStatus.BAD_REQUEST,
    //     );
    //     expect(response.body).toHaveProperty(
    //       'statusCode',
    //     );
    //     expect(response.body).toHaveProperty(
    //       'message',
    //     );
    //     expect(response.body.statusCode).toEqual(
    //       HttpStatus.BAD_REQUEST,
    //     );
    //     expect(response.body.message).toEqual(
    //       'Invalid request data',
    //     );
    //   });

    //   it('/file-manager/delete_file/ (POST) - valid request', async () => {
    //     const requestMarkdownFileDTO =
    //       new MarkdownFileDTO();
    //     requestMarkdownFileDTO.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );
    //     requestMarkdownFileDTO.MarkdownID =
    //       DELETE_MARKDOWN_ID;

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/delete_file/')
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestMarkdownFileDTO);

    //     expect(response.status).toBe(
    //       HttpStatus.OK,
    //     );
    //     console.log(
    //       'response.body: ',
    //       response.body,
    //     );
    //     expect(response.body).toHaveProperty(
    //       'affected',
    //     );
    //     expect(response.body.affected).toEqual(1);
    //   });
    // });
  });
});
