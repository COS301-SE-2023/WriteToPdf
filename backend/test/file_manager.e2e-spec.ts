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
let fileID = '';
let folderID = '';

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

    // await resetUser();
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
    // await resetUser();
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

    // Delete all the test user's files
    for (const file of testUserFiles) {
      const deleteFileDTO = new MarkdownFileDTO();
      deleteFileDTO.UserID = parseInt(
        process.env.TEST_USERID,
      );
      deleteFileDTO.MarkdownID = file.MarkdownID;

      await s3Service.deleteFile(deleteFileDTO);
    }

    folderID = '';
    // Reset the db for the test user
    await markdownFileRepository.query(
      'DELETE FROM MARKDOWN_FILES WHERE UserID = ?',
      [process.env.TEST_USERID],
    );
    await markdownFileRepository.query(
      'DELETE FROM FOLDERS WHERE UserID = ?',
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

    s3Response.Content = 'Test content';

    await s3Service.saveFile(s3Response);

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

    // Create a test folder
    const createFolderDTO = new FolderDTO();
    createFolderDTO.UserID = parseInt(
      process.env.TEST_USERID,
    );
    createFolderDTO.FolderName = 'Test Folder';
    createFolderDTO.ParentFolderID = '';
    createFolderDTO.Path = '';
    createFolderDTO.FolderID = '1';
    folderID = createFolderDTO.FolderID;

    await markdownFileRepository.query(
      'INSERT INTO FOLDERS (FolderID, FolderName, Path, ParentFolderID, UserID) VALUES (?, ?, ?, ?, ?)',
      [
        createFolderDTO.FolderID,
        createFolderDTO.FolderName,
        createFolderDTO.Path,
        createFolderDTO.ParentFolderID,
        createFolderDTO.UserID,
      ],
    );
  }

  describe('file-manager endpoint', () => {
    it('should be mocked out', () => {
      expect(true).toBe(true);
    });
    // describe('create_file', () => {
    //   it('/file-manager/create_file/ (POST) - missing UserID', async () => {
    //     const requestMarkdownFileDTO =
    //       new MarkdownFileDTO();

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/create_file/')
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

    //   it('/file-manager/create_file/ (POST) - valid request', async () => {
    //     const requestMarkdownFileDTO =
    //       new MarkdownFileDTO();
    //     requestMarkdownFileDTO.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/create_file/')
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestMarkdownFileDTO);

    //     expect(response.body).toHaveProperty(
    //       'MarkdownID',
    //     );
    //     fileID = response.body.MarkdownID;
    //     expect(response.status).toBe(
    //       HttpStatus.OK,
    //     );
    //     expect(response.body).toHaveProperty(
    //       'Name',
    //     );
    //     expect(response.body).toHaveProperty(
    //       'Content',
    //     );
    //     expect(response.body).toHaveProperty(
    //       'Path',
    //     );
    //     expect(response.body).toHaveProperty(
    //       'DateCreated',
    //     );
    //     expect(response.body).toHaveProperty(
    //       'LastModified',
    //     );
    //     expect(response.body).toHaveProperty(
    //       'Size',
    //     );
    //     expect(response.body).toHaveProperty(
    //       'ParentFolderID',
    //     );
    //     expect(response.body).toHaveProperty(
    //       'UserID',
    //     );
    //     expect(response.body.Name).toEqual(
    //       'New Document',
    //     );
    //     expect(response.body.Path).toEqual('');
    //     expect(
    //       response.body.ParentFolderID,
    //     ).toEqual('');
    //   });
    // });

    // describe('delete_file', () => {
    //   it('/file-manager/delete_file/ (POST) - missing UserID', async () => {
    //     const requestMarkdownFileDTO =
    //       new MarkdownFileDTO();
    //     requestMarkdownFileDTO.MarkdownID =
    //       fileID;

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
    //       fileID;

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
    //     expect(response.body).toHaveProperty(
    //       'affected',
    //     );
    //     expect(response.body.affected).toEqual(1);
    //   });
    // });

    // describe('rename_file', () => {
    //   it('/file-manager/rename_file/ (POST) - missing UserID', async () => {
    //     const requestMarkdownFileDTO =
    //       new MarkdownFileDTO();
    //     requestMarkdownFileDTO.MarkdownID =
    //       fileID;
    //     requestMarkdownFileDTO.Name = 'New Name';

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/rename_file/')
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

    //   it('/file-manager/rename_file/ (POST) - missing MarkdownID', async () => {
    //     const requestMarkdownFileDTO =
    //       new MarkdownFileDTO();
    //     requestMarkdownFileDTO.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );
    //     requestMarkdownFileDTO.Name = 'New Name';

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/rename_file/')
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

    //   it('/file-manager/rename_file/ (POST) - missing Name', async () => {
    //     const requestMarkdownFileDTO =
    //       new MarkdownFileDTO();
    //     requestMarkdownFileDTO.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );
    //     requestMarkdownFileDTO.MarkdownID =
    //       fileID;

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/rename_file/')
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

    //   it('/file-manager/rename_file/ (POST) - valid request', async () => {
    //     const requestMarkdownFileDTO =
    //       new MarkdownFileDTO();
    //     requestMarkdownFileDTO.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );
    //     requestMarkdownFileDTO.MarkdownID =
    //       fileID;
    //     requestMarkdownFileDTO.Name = 'New Name';

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/rename_file/')
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestMarkdownFileDTO);

    //     // console.log('response.body: ', response.body);
    //     expect(response.body).toHaveProperty(
    //       'MarkdownID',
    //     );
    //     expect(response.status).toBe(
    //       HttpStatus.OK,
    //     );
    //     expect(response.body).toHaveProperty(
    //       'Name',
    //     );
    //     expect(response.body).toHaveProperty(
    //       'UserID',
    //     );
    //     expect(response.body.MarkdownID).toEqual(
    //       fileID,
    //     );
    //     expect(response.body.Name).toEqual(
    //       'New Name',
    //     );
    //     expect(response.body.UserID).toEqual(
    //       parseInt(process.env.TEST_USERID),
    //     );
    //   });
    // });

    // describe('move_file', () => {
    //   it('/file-manager/move_file/ (POST) - missing UserID', async () => {
    //     const requestMarkdownFileDTO =
    //       new MarkdownFileDTO();
    //     requestMarkdownFileDTO.MarkdownID =
    //       fileID;
    //     requestMarkdownFileDTO.ParentFolderID =
    //       'test';
    //     requestMarkdownFileDTO.Path = 'test';

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/move_file/')
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

    //   it('/file-manager/move_file/ (POST) - missing MarkdownID', async () => {
    //     const requestMarkdownFileDTO =
    //       new MarkdownFileDTO();
    //     requestMarkdownFileDTO.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );
    //     requestMarkdownFileDTO.ParentFolderID =
    //       'test';
    //     requestMarkdownFileDTO.Path = 'test';

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/move_file/')
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

    //   it('/file-manager/move_file/ (POST) - missing ParentFolderID', async () => {
    //     const requestMarkdownFileDTO =
    //       new MarkdownFileDTO();
    //     requestMarkdownFileDTO.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );
    //     requestMarkdownFileDTO.MarkdownID =
    //       fileID;
    //     requestMarkdownFileDTO.Path = 'test';

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/move_file/')
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

    //   it('/file-manager/move_file/ (POST) - missing Path', async () => {
    //     const requestMarkdownFileDTO =
    //       new MarkdownFileDTO();
    //     requestMarkdownFileDTO.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );
    //     requestMarkdownFileDTO.MarkdownID =
    //       fileID;
    //     requestMarkdownFileDTO.ParentFolderID =
    //       'test';

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/move_file/')
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

    //   it('/file-manager/move_file/ (POST) - valid request', async () => {
    //     const requestMarkdownFileDTO =
    //       new MarkdownFileDTO();
    //     requestMarkdownFileDTO.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );
    //     requestMarkdownFileDTO.MarkdownID =
    //       fileID;
    //     requestMarkdownFileDTO.ParentFolderID =
    //       'test';
    //     requestMarkdownFileDTO.Path = 'test';

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/move_file/')
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestMarkdownFileDTO);

    //     expect(response.body).toHaveProperty(
    //       'MarkdownID',
    //     );
    //     expect(response.status).toBe(
    //       HttpStatus.OK,
    //     );
    //     expect(response.body).toHaveProperty(
    //       'Name',
    //     );
    //     expect(response.body).toHaveProperty(
    //       'UserID',
    //     );
    //     expect(response.body).toHaveProperty(
    //       'Path',
    //     );
    //     expect(response.body).toHaveProperty(
    //       'ParentFolderID',
    //     );
    //     expect(response.body.MarkdownID).toEqual(
    //       fileID,
    //     );
    //     expect(response.body.Path).toEqual(
    //       'test',
    //     );
    //     expect(
    //       response.body.ParentFolderID,
    //     ).toEqual('test');
    //     expect(response.body.UserID).toEqual(
    //       parseInt(process.env.TEST_USERID),
    //     );
    //   });
    // });

    // describe('save_file', () => {
    //   it('/file-manager/save_file/ (POST) - missing UserID', async () => {
    //     const requestMarkdownFileDTO =
    //       new MarkdownFileDTO();
    //     requestMarkdownFileDTO.MarkdownID =
    //       fileID;
    //     requestMarkdownFileDTO.Content = 'test';

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/save_file/')
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

    //   it('/file-manager/save_file/ (POST) - missing MarkdownID', async () => {
    //     const requestMarkdownFileDTO =
    //       new MarkdownFileDTO();
    //     requestMarkdownFileDTO.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );
    //     requestMarkdownFileDTO.Content = 'test';

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/save_file/')
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

    //   it('/file-manager/save_file/ (POST) - missing Content', async () => {
    //     const requestMarkdownFileDTO =
    //       new MarkdownFileDTO();
    //     requestMarkdownFileDTO.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );
    //     requestMarkdownFileDTO.MarkdownID =
    //       fileID;

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/save_file/')
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

    //   it('/file-manager/save_file/ (POST) - valid request', async () => {
    //     const requestMarkdownFileDTO =
    //       new MarkdownFileDTO();
    //     requestMarkdownFileDTO.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );
    //     requestMarkdownFileDTO.MarkdownID =
    //       fileID;
    //     requestMarkdownFileDTO.Content = 'test';

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/save_file/')
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestMarkdownFileDTO);

    //     expect(response.body).toHaveProperty(
    //       'MarkdownID',
    //     );
    //     expect(response.status).toBe(
    //       HttpStatus.OK,
    //     );
    //     expect(response.body).toHaveProperty(
    //       'Name',
    //     );
    //     expect(response.body).toHaveProperty(
    //       'UserID',
    //     );
    //     expect(response.body).toHaveProperty(
    //       'Path',
    //     );
    //     expect(response.body).toHaveProperty(
    //       'ParentFolderID',
    //     );
    //     expect(response.body.MarkdownID).toEqual(
    //       fileID,
    //     );
    //     expect(response.body.Path).toEqual('');
    //     expect(
    //       response.body.ParentFolderID,
    //     ).toEqual('');
    //     expect(response.body.UserID).toEqual(
    //       parseInt(process.env.TEST_USERID),
    //     );
    //     //TODO expand test to check the s3 bucket
    //   });
    // });

    // describe('retrieve_file', () => {
    //   it('/file-manager/retrieve_file/ (POST) - missing UserID', async () => {
    //     const requestMarkdownFileDTO =
    //       new MarkdownFileDTO();
    //     requestMarkdownFileDTO.MarkdownID =
    //       fileID;

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/retrieve_file/')
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

    //   it('/file-manager/retrieve_file/ (POST) - missing MarkdownID', async () => {
    //     const requestMarkdownFileDTO =
    //       new MarkdownFileDTO();
    //     requestMarkdownFileDTO.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/retrieve_file/')
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

    //   it('/file-manager/retrieve_file/ (POST) - valid request', async () => {
    //     const requestMarkdownFileDTO =
    //       new MarkdownFileDTO();
    //     requestMarkdownFileDTO.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );
    //     requestMarkdownFileDTO.MarkdownID =
    //       fileID;

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/retrieve_file/')
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestMarkdownFileDTO);

    //     expect(response.body).toHaveProperty(
    //       'MarkdownID',
    //     );
    //     expect(response.status).toBe(
    //       HttpStatus.OK,
    //     );
    //     expect(response.body).toHaveProperty(
    //       'UserID',
    //     );
    //     expect(response.body.MarkdownID).toEqual(
    //       fileID,
    //     );
    //     expect(response.body.UserID).toEqual(
    //       parseInt(process.env.TEST_USERID),
    //     );
    //     expect(response.body.Content).toEqual(
    //       'Test content',
    //     );
    //     expect(response.body.Size).not.toEqual(0);
    //   });
    // });

    // describe('retrieve_all_files', () => {
    //   it('/file-manager/retrieve_all_files/ (POST) - missing UserID', async () => {
    //     const requestDirectoryFilesDTO =
    //       new DirectoryFilesDTO();

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post(
    //         '/file_manager/retrieve_all_files/',
    //       )
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestDirectoryFilesDTO);

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

    //   it('file-manager/retrieve_all_files/ (POST) - valid request', async () => {
    //     const requestDirectoryFilesDTO =
    //       new DirectoryFilesDTO();
    //     requestDirectoryFilesDTO.UserID =
    //       parseInt(process.env.TEST_USERID);

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post(
    //         '/file_manager/retrieve_all_files/',
    //       )
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestDirectoryFilesDTO);

    //     expect(response.body).toHaveProperty(
    //       'UserID',
    //     );
    //     expect(response.status).toBe(
    //       HttpStatus.OK,
    //     );
    //     expect(response.body).toHaveProperty(
    //       'Files',
    //     );
    //     expect(response.body.UserID).toEqual(
    //       parseInt(process.env.TEST_USERID),
    //     );
    //     expect(response.body.Files).not.toEqual(
    //       [],
    //     );
    //     expect(response.body.Files).toHaveLength(
    //       1,
    //     );
    //     expect(
    //       response.body.Files[0],
    //     ).toHaveProperty('MarkdownID');
    //   });
    // });

    // describe('create_folder', () => {
    //   it('/file-manager/create_folder/ (POST) - missing UserID', async () => {
    //     const requestFolder = new FolderDTO();
    //     requestFolder.FolderName = 'test';
    //     requestFolder.Path = 'test';

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/create_folder/')
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestFolder);

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

    //   it('/file-manager/create_folder/ (POST) - missing FolderName', async () => {
    //     const requestFolder = new FolderDTO();
    //     requestFolder.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );
    //     requestFolder.Path = 'test';

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/create_folder/')
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestFolder);

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

    //   it('/file-manager/create_folder/ (POST) - missing Path', async () => {
    //     const requestFolder = new FolderDTO();
    //     requestFolder.FolderName = 'test';
    //     requestFolder.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/create_folder/')
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestFolder);

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

    //   it('/file-manager/create_folder/ (POST) - valid request', async () => {
    //     const requestFolder = new FolderDTO();
    //     requestFolder.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );
    //     requestFolder.FolderName = 'Test Name';
    //     requestFolder.Path = 'Test Path';
    //     requestFolder.ParentFolderID =
    //       'Test ParentFolderID';

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/create_folder/')
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestFolder);

    //     expect(response.body).toHaveProperty(
    //       'FolderID',
    //     );
    //     fileID = response.body.MarkdownID;
    //     expect(response.status).toBe(
    //       HttpStatus.OK,
    //     );
    //     expect(response.body).toHaveProperty(
    //       'FolderName',
    //     );
    //     expect(response.body).toHaveProperty(
    //       'Path',
    //     );
    //     expect(response.body).toHaveProperty(
    //       'DateCreated',
    //     );
    //     expect(response.body).toHaveProperty(
    //       'LastModified',
    //     );
    //     expect(response.body).toHaveProperty(
    //       'ParentFolderID',
    //     );
    //     expect(response.body).toHaveProperty(
    //       'UserID',
    //     );
    //     expect(response.body.FolderName).toEqual(
    //       'Test Name',
    //     );
    //     expect(response.body.Path).toEqual(
    //       'Test Path',
    //     );
    //     expect(
    //       response.body.ParentFolderID,
    //     ).toEqual('Test ParentFolderID');
    //     expect(response.body.UserID).toEqual(
    //       parseInt(process.env.TEST_USERID),
    //     );
    //   });
    // });

    // describe('delete_folder', () => {
    //   it('/file-manager/delete_folder/ (POST) - missing UserID', async () => {
    //     const requestFolder = new FolderDTO();
    //     requestFolder.FolderID = folderID;

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/delete_folder/')
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestFolder);

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

    //   it('/file-manager/delete_folder/ (POST) - missing FolderID', async () => {
    //     const requestFolder = new FolderDTO();
    //     requestFolder.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/delete_folder/')
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestFolder);

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

    //   it('file-manager/delete_folder/ (POST) - valid request', async () => {
    //     const requestFolder = new FolderDTO();
    //     requestFolder.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );
    //     requestFolder.FolderID = folderID;

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/delete_folder/')
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestFolder);

    //     expect(response.status).toBe(
    //       HttpStatus.OK,
    //     );
    //   });
    // });

    // describe('rename_folder', () => {
    //   it('/file-manager/rename_folder/ (POST) - missing UserID', async () => {
    //     const requestFolder = new FolderDTO();
    //     requestFolder.FolderID = folderID;
    //     requestFolder.FolderName = 'New Name';

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/rename_folder/')
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestFolder);

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

    //   it('/file-manager/rename_folder/ (POST) - missing FolderName', async () => {
    //     const requestFolder = new FolderDTO();
    //     requestFolder.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );
    //     requestFolder.FolderID = folderID;

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/rename_folder/')
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestFolder);

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

    //   it('/file-manager/rename_folder/ (POST) - missing FolderID', async () => {
    //     const requestFolder = new FolderDTO();
    //     requestFolder.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );
    //     requestFolder.FolderName = 'New Name';

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/rename_folder/')
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestFolder);

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

    //   it('/file-manager/rename_folder/ (POST) - valid request', async () => {
    //     const requestFolder = new FolderDTO();
    //     requestFolder.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );
    //     requestFolder.FolderID = folderID;
    //     requestFolder.FolderName = 'New Name';

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/rename_folder/')
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestFolder);

    //     expect(response.body).toHaveProperty(
    //       'FolderID',
    //     );
    //     expect(response.status).toBe(
    //       HttpStatus.OK,
    //     );
    //     expect(response.body).toHaveProperty(
    //       'FolderName',
    //     );
    //     expect(response.body.FolderName).toEqual(
    //       'New Name',
    //     );
    //   });
    // });

    // describe('move_folder', () => {
    //   it('/file-manager/move_folder/ (POST) - missing UserID', async () => {
    //     const requestFolder = new FolderDTO();
    //     requestFolder.FolderID = folderID;
    //     requestFolder.ParentFolderID = '';
    //     requestFolder.Path = '';

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/move_folder/')
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestFolder);

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

    //   it('/file-manager/move_folder/ (POST) - missing ParentFolderID', async () => {
    //     const requestFolder = new FolderDTO();
    //     requestFolder.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );
    //     requestFolder.FolderID = folderID;
    //     requestFolder.Path = '';

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/move_folder/')
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestFolder);

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

    //   it('/file-manager/move_folder/ (POST) - missing FolderID', async () => {
    //     const requestFolder = new FolderDTO();
    //     requestFolder.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );
    //     requestFolder.Path = '';
    //     requestFolder.ParentFolderID = '';

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/move_folder/')
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestFolder);

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

    //   it('/file-manager/move_folder/ (POST) - missing Path', async () => {
    //     const requestFolder = new FolderDTO();
    //     requestFolder.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );
    //     requestFolder.FolderID = folderID;
    //     requestFolder.ParentFolderID = '';

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/move_folder/')
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestFolder);

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

    //   it('/file-manager/move_folder/ (POST) - valid request', async () => {
    //     const requestFolder = new FolderDTO();
    //     requestFolder.UserID = parseInt(
    //       process.env.TEST_USERID,
    //     );
    //     requestFolder.FolderID = folderID;
    //     requestFolder.ParentFolderID =
    //       'New ParentFolderID';
    //     requestFolder.Path = 'New Path';

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post('/file_manager/move_folder/')
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestFolder);

    //     expect(response.body).toHaveProperty(
    //       'FolderID',
    //     );
    //     expect(response.status).toBe(
    //       HttpStatus.OK,
    //     );
    //     expect(response.body).toHaveProperty(
    //       'FolderName',
    //     );
    //     expect(response.body).toHaveProperty(
    //       'Path',
    //     );
    //     expect(response.body).toHaveProperty(
    //       'ParentFolderID',
    //     );
    //     expect(response.body.Path).toEqual(
    //       'New Path',
    //     );
    //     expect(
    //       response.body.ParentFolderID,
    //     ).toEqual('New ParentFolderID');
    //   });
    // });

    // describe('retrieve_all_folders', () => {
    //   it('/file-manager/retrieve_all_folders/ (POST) - missing UserID', async () => {
    //     const requestDirectoryFoldersDTO =
    //       new DirectoryFoldersDTO();

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post(
    //         '/file_manager/retrieve_all_folders/',
    //       )
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestDirectoryFoldersDTO);

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

    //   it('file-manager/retrieve_all_folders/ (POST) - valid request', async () => {
    //     const requestDirectoryFoldersDTO =
    //       new DirectoryFoldersDTO();
    //     requestDirectoryFoldersDTO.UserID =
    //       parseInt(process.env.TEST_USERID);

    //     const response = await request(
    //       app.getHttpServer(),
    //     )
    //       .post(
    //         '/file_manager/retrieve_all_folders/',
    //       )
    //       .set(
    //         'Authorization',
    //         'Bearer ' + process.env.AUTH_BEARER,
    //       )
    //       .send(requestDirectoryFoldersDTO);

    //     expect(response.body).toHaveProperty(
    //       'UserID',
    //     );
    //     expect(response.status).toBe(
    //       HttpStatus.OK,
    //     );
    //     expect(response.body).toHaveProperty(
    //       'Folders',
    //     );
    //     expect(response.body.UserID).toEqual(
    //       parseInt(process.env.TEST_USERID),
    //     );
    //     expect(response.body.Folders).not.toEqual(
    //       [],
    //     );
    //     expect(
    //       response.body.Folders,
    //     ).toHaveLength(1);
    //     expect(
    //       response.body.Folders[0],
    //     ).toHaveProperty('FolderID');
    //   });
    // });
  });
});
