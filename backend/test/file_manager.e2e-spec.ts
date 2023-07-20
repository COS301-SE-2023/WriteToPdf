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
import e from 'express';

let startTime: string;
let fileID = '';

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

    await resetUser();
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
    // await cleanUp();
    await resetUser();
  });

  // afterAll(async () => {
  // });

  async function resetUser() {
    // Get all the test user's files
    const testUserFiles =
      await markdownFileRepository.query(
        'SELECT * FROM MARKDOWN_FILES WHERE UserID = ?',
        [process.env.TEST_USERID],
      );

    // console.log('testUserFiles: ', testUserFiles);

    // Delete all the test user's files
    for (const file of testUserFiles) {
      const deleteFileDTO = new MarkdownFileDTO();
      deleteFileDTO.UserID = parseInt(
        process.env.TEST_USERID,
      );
      deleteFileDTO.MarkdownID = file.MarkdownID;

      await s3Service.deleteFile(deleteFileDTO);
    }

    // Reset the db for the test user
    await markdownFileRepository.query(
      'DELETE FROM MARKDOWN_FILES WHERE UserID = ?',
      [process.env.TEST_USERID],
    );

    // Create a test file
    const createFileDTO = new MarkdownFileDTO();
    createFileDTO.UserID = parseInt(
      process.env.TEST_USERID,
    );
    createFileDTO.Path = '';
    createFileDTO.Name = 'Test File';
    createFileDTO.Size = 0;
    createFileDTO.ParentFolderID = '';

    const s3Response = await s3Service.createFile(
      createFileDTO,
    );

    fileID = s3Response.MarkdownID;
    // console.log('Setting fileID to ', fileID);
    // console.log('s3Response: ', s3Response);

    await markdownFileRepository.query(
      'INSERT INTO MARKDOWN_FILES (MarkdownID, Name, Path, Size, ParentFolderID, UserID) VALUES (?, ?, ?, ?, ?, ?)',
      [
        s3Response.MarkdownID,
        createFileDTO.Name,
        createFileDTO.Path,
        createFileDTO.Size,
        createFileDTO.ParentFolderID,
        createFileDTO.UserID,
      ],
    );
  }

  // async function cleanUp() {
  //   console.log(
  //     'expect.getState().currentTestName: ',
  //     expect.getState().currentTestName,
  //   );
  //   switch (expect.getState().currentTestName) {
  //     case 'FileManagerController (integration) file-manager endpoint create_file /file-manager/create_file/ (POST) - valid request':
  //       await markdownFileRepository.query(
  //         'DELETE FROM MARKDOWN_FILES WHERE MarkdownID = ? AND UserID = ?',
  //         [fileID, process.env.TEST_USERID],
  //       );
  //       const createFileDTO =
  //         new MarkdownFileDTO();
  //       createFileDTO.UserID = parseInt(
  //         process.env.TEST_USERID,
  //       );
  //       createFileDTO.Path = '';
  //       createFileDTO.MarkdownID = fileID;
  //       await s3Service.deleteFile(createFileDTO);
  //       break;

  //     case 'FileManagerController (integration) file-manager endpoint /file-manager/delete_file/ (POST) - valid request':
  //       const deleteFileDTO =
  //         new MarkdownFileDTO();
  //       deleteFileDTO.UserID = parseInt(
  //         process.env.TEST_USERID,
  //       );
  //       deleteFileDTO.Path = '';
  //       deleteFileDTO.Name = 'Test File';
  //       deleteFileDTO.Size = 0;
  //       deleteFileDTO.ParentFolderID = '';

  //       const s3Response =
  //         await s3Service.createFile(
  //           deleteFileDTO,
  //         );

  //       fileID = s3Response.MarkdownID;

  //       await markdownFileRepository.query(
  //         'INSERT INTO MARKDOWN_FILES (MarkdownID, Name, Path, Size, ParentFolderID, UserID) VALUES (?, ?, ?, ?, ?, ?)',
  //         [
  //           s3Response.MarkdownID,
  //           deleteFileDTO.Name,
  //           deleteFileDTO.Path,
  //           deleteFileDTO.Size,
  //           deleteFileDTO.ParentFolderID,
  //           deleteFileDTO.UserID,
  //         ],
  //       );
  //       break;
  //   }
  // }

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

    describe('delete_file', () => {
      it('/file-manager/delete_file/ (POST) - missing UserID', async () => {
        const requestMarkdownFileDTO =
          new MarkdownFileDTO();
        requestMarkdownFileDTO.MarkdownID =
          fileID;

        const response = await request(
          app.getHttpServer(),
        )
          .post('/file_manager/delete_file/')
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

      it('/file-manager/delete_file/ (POST) - missing MarkdownID', async () => {
        const requestMarkdownFileDTO =
          new MarkdownFileDTO();
        requestMarkdownFileDTO.UserID = parseInt(
          process.env.TEST_USERID,
        );

        const response = await request(
          app.getHttpServer(),
        )
          .post('/file_manager/delete_file/')
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

      it('/file-manager/delete_file/ (POST) - valid request', async () => {
        const requestMarkdownFileDTO =
          new MarkdownFileDTO();
        requestMarkdownFileDTO.UserID = parseInt(
          process.env.TEST_USERID,
        );

        requestMarkdownFileDTO.MarkdownID =
          fileID;

        const response = await request(
          app.getHttpServer(),
        )
          .post('/file_manager/delete_file/')
          .set(
            'Authorization',
            'Bearer ' + process.env.AUTH_BEARER,
          )
          .send(requestMarkdownFileDTO);

        expect(response.status).toBe(
          HttpStatus.OK,
        );
        expect(response.body).toHaveProperty(
          'affected',
        );
        expect(response.body.affected).toEqual(1);
      });
    });

    describe('rename_file', () => {
      it('/file-manager/rename_file/ (POST) - missing UserID', async () => {
        const requestMarkdownFileDTO =
          new MarkdownFileDTO();
        requestMarkdownFileDTO.MarkdownID =
          fileID;
        requestMarkdownFileDTO.Name = 'New Name';

        const response = await request(
          app.getHttpServer(),
        )
          .post('/file_manager/rename_file/')
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

      it('/file-manager/rename_file/ (POST) - missing MarkdownID', async () => {
        const requestMarkdownFileDTO =
          new MarkdownFileDTO();
        requestMarkdownFileDTO.UserID = parseInt(
          process.env.TEST_USERID,
        );
        requestMarkdownFileDTO.Name = 'New Name';

        const response = await request(
          app.getHttpServer(),
        )
          .post('/file_manager/rename_file/')
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

      it('/file-manager/rename_file/ (POST) - missing Name', async () => {
        const requestMarkdownFileDTO =
          new MarkdownFileDTO();
        requestMarkdownFileDTO.UserID = parseInt(
          process.env.TEST_USERID,
        );
        requestMarkdownFileDTO.MarkdownID =
          fileID;

        const response = await request(
          app.getHttpServer(),
        )
          .post('/file_manager/rename_file/')
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

      it('/file-manager/rename_file/ (POST) - valid request', async () => {
        const requestMarkdownFileDTO =
          new MarkdownFileDTO();
        requestMarkdownFileDTO.UserID = parseInt(
          process.env.TEST_USERID,
        );
        requestMarkdownFileDTO.MarkdownID =
          fileID;
        requestMarkdownFileDTO.Name = 'New Name';

        const response = await request(
          app.getHttpServer(),
        )
          .post('/file_manager/rename_file/')
          .set(
            'Authorization',
            'Bearer ' + process.env.AUTH_BEARER,
          )
          .send(requestMarkdownFileDTO);

        // console.log('response.body: ', response.body);
        expect(response.body).toHaveProperty(
          'MarkdownID',
        );
        expect(response.status).toBe(
          HttpStatus.OK,
        );
        expect(response.body).toHaveProperty(
          'Name',
        );
        expect(response.body).toHaveProperty(
          'UserID',
        );
        expect(response.body.MarkdownID).toEqual(
          fileID,
        );
        expect(response.body.Name).toEqual(
          'New Name',
        );
        expect(response.body.UserID).toEqual(
          parseInt(process.env.TEST_USERID),
        );
      });
    });

    describe('move_file', () => {
      it('/file-manager/move_file/ (POST) - missing UserID', async () => {
        const requestMarkdownFileDTO =
          new MarkdownFileDTO();
        requestMarkdownFileDTO.MarkdownID =
          fileID;
        requestMarkdownFileDTO.ParentFolderID =
          'test';
        requestMarkdownFileDTO.Path = 'test';

        const response = await request(
          app.getHttpServer(),
        )
          .post('/file_manager/move_file/')
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

      it('/file-manager/move_file/ (POST) - missing MarkdownID', async () => {
        const requestMarkdownFileDTO =
          new MarkdownFileDTO();
        requestMarkdownFileDTO.UserID = parseInt(
          process.env.TEST_USERID,
        );
        requestMarkdownFileDTO.ParentFolderID =
          'test';
        requestMarkdownFileDTO.Path = 'test';

        const response = await request(
          app.getHttpServer(),
        )
          .post('/file_manager/move_file/')
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

      it('/file-manager/move_file/ (POST) - missing ParentFolderID', async () => {
        const requestMarkdownFileDTO =
          new MarkdownFileDTO();
        requestMarkdownFileDTO.UserID = parseInt(
          process.env.TEST_USERID,
        );
        requestMarkdownFileDTO.MarkdownID =
          fileID;
        requestMarkdownFileDTO.Path = 'test';

        const response = await request(
          app.getHttpServer(),
        )
          .post('/file_manager/move_file/')
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

      it('/file-manager/move_file/ (POST) - missing Path', async () => {
        const requestMarkdownFileDTO =
          new MarkdownFileDTO();
        requestMarkdownFileDTO.UserID = parseInt(
          process.env.TEST_USERID,
        );
        requestMarkdownFileDTO.MarkdownID =
          fileID;
        requestMarkdownFileDTO.ParentFolderID =
          'test';

        const response = await request(
          app.getHttpServer(),
        )
          .post('/file_manager/move_file/')
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

      it('/file-manager/move_file/ (POST) - valid request', async () => {
        const requestMarkdownFileDTO =
          new MarkdownFileDTO();
        requestMarkdownFileDTO.UserID = parseInt(
          process.env.TEST_USERID,
        );
        requestMarkdownFileDTO.MarkdownID =
          fileID;
        requestMarkdownFileDTO.ParentFolderID =
          'test';
        requestMarkdownFileDTO.Path = 'test';

        const response = await request(
          app.getHttpServer(),
        )
          .post('/file_manager/move_file/')
          .set(
            'Authorization',
            'Bearer ' + process.env.AUTH_BEARER,
          )
          .send(requestMarkdownFileDTO);

        expect(response.body).toHaveProperty(
          'MarkdownID',
        );
        expect(response.status).toBe(
          HttpStatus.OK,
        );
        expect(response.body).toHaveProperty(
          'Name',
        );
        expect(response.body).toHaveProperty(
          'UserID',
        );
        expect(response.body).toHaveProperty(
          'Path',
        );
        expect(response.body).toHaveProperty(
          'ParentFolderID',
        );
        expect(response.body.MarkdownID).toEqual(
          fileID,
        );
        expect(response.body.Path).toEqual(
          'test',
        );
        expect(
          response.body.ParentFolderID,
        ).toEqual('test');
        expect(response.body.UserID).toEqual(
          parseInt(process.env.TEST_USERID),
        );
      });
    });
  });
});
