import { Injectable } from '@nestjs/common';
import { FileDTO } from './dto/file.dto';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import 'dotenv/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
// import * as fs from 'fs';
import {
  writeFile,
  mkdir,
  access,
  unlink,
  readFile,
  stat,
} from 'fs/promises';

import { randomBytes } from 'crypto';

@Injectable()
export class S3Service {
  awsS3BucketName =
    process.env.AWS_S3_BUCKET_NAME;
  awsS3BucketRegion =
    process.env.AWS_S3_BUCKET_REGION;
  awsS3AccessKeyId =
    process.env.AWS_S3_ACCESS_KEY_ID;
  awsS3SecretAccessKey =
    process.env.AWS_S3_SECRET_ACCESS_KEY;

  private readonly s3Client = new S3Client({
    credentials: {
      accessKeyId: this.awsS3AccessKeyId,
      secretAccessKey: this.awsS3SecretAccessKey,
    },
    region: this.awsS3BucketRegion,
  });

  async upload(fileDTO: FileDTO, file: Buffer) {
    const filePath =
      fileDTO.UserID +
      '/' +
      fileDTO.ParentDirectory +
      '/' +
      fileDTO.FileName;

    return await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.awsS3BucketName,
        Key: filePath,
        Body: file,
      }),
    );
  }

  async download(fileDTO: FileDTO) {
    const filePath =
      fileDTO.UserID +
      '/' +
      fileDTO.ParentDirectory +
      '/' +
      fileDTO.FileName;

    return await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.awsS3BucketName,
        Key: filePath,
      }),
    );
  }

  async delete(fileDTO: FileDTO) {
    const filePath =
      fileDTO.UserID +
      '/' +
      fileDTO.ParentDirectory +
      '/' +
      fileDTO.FileName;

    return await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.awsS3BucketName,
        Key: filePath,
      }),
    );
  }

  async renameFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    return markdownFileDTO;
  }

  async deleteFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    let filePath = '';
    if (markdownFileDTO.Path === undefined)
      filePath = `./storage/${markdownFileDTO.UserID}/${markdownFileDTO.MarkdownID}.txt`;
    else
      filePath = `./storage/${markdownFileDTO.UserID}/${markdownFileDTO.Path}/${markdownFileDTO.MarkdownID}.txt`;

    console.log(filePath);

    try {
      await access(filePath);
    } catch (err) {
      console.log('Access Error --> ' + err);
      return undefined;
    }

    try {
      await unlink(filePath);
    } catch (err) {
      console.log('Delete Error --> ' + err);
      return undefined;
    }

    return markdownFileDTO;
  }

  async createFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    if (markdownFileDTO.Name === undefined)
      markdownFileDTO.Name = 'New Document.txt';

    if (markdownFileDTO.UserID === undefined)
      markdownFileDTO.UserID = 'abc123';

    markdownFileDTO.MarkdownID =
      randomBytes(16).toString('hex');

    let filePath = '';
    if (markdownFileDTO.Path === undefined)
      filePath = `./storage/${markdownFileDTO.UserID}`;
    else
      filePath = `./storage/${markdownFileDTO.UserID}/${markdownFileDTO.Path}`;

    console.log(filePath);

    try {
      await mkdir(filePath, {
        recursive: true,
      });
    } catch (err) {
      console.log(
        'Directory Creation Error:' + err,
      );
      return undefined;
    }

    try {
      await writeFile(
        `${filePath}/${markdownFileDTO.MarkdownID}.txt`,
        '',
        'utf-8',
      );
    } catch (err) {
      console.log('Write File Error:' + err);
      return undefined;
    }

    const fileStats = await stat(filePath);
    console.log(fileStats);
    markdownFileDTO.Content = '';
    markdownFileDTO.DateCreated =
      fileStats.birthtime;
    markdownFileDTO.LastModified =
      fileStats.mtime;
    markdownFileDTO.Size = fileStats.size;

    return markdownFileDTO;
  }

  async saveFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    let filePath = '';
    if (markdownFileDTO.Path === undefined)
      filePath = `./storage/${markdownFileDTO.UserID}/${markdownFileDTO.MarkdownID}.txt`;
    else
      filePath = `./storage/${markdownFileDTO.UserID}/${markdownFileDTO.Path}/${markdownFileDTO.MarkdownID}.txt`;

    console.log(filePath);

    try {
      await access(filePath);
    } catch (err) {
      console.log('Access Error --> ' + err);
      return undefined;
    }

    const fileData = new Uint8Array(
      Buffer.from(markdownFileDTO.Content),
    );

    try {
      await writeFile(
        `${filePath}`,
        fileData,
        'utf-8',
      );
    } catch (err) {
      console.log('Write File Error:' + err);
      return undefined;
    }

    const fileStats = await stat(filePath);
    console.log(fileStats);
    markdownFileDTO.LastModified =
      fileStats.mtime;
    markdownFileDTO.Size = fileStats.size;

    return markdownFileDTO;
  }

  async retrieveFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    let filePath = '';
    if (markdownFileDTO.Path === undefined)
      filePath = `./storage/${markdownFileDTO.UserID}/${markdownFileDTO.MarkdownID}.txt`;
    else
      filePath = `./storage/${markdownFileDTO.UserID}/${markdownFileDTO.Path}/${markdownFileDTO.MarkdownID}.txt`;

    try {
      await access(filePath);
    } catch (err) {
      console.log('Access Error --> ' + err);
      return undefined;
    }

    try {
      markdownFileDTO.Content = await readFile(
        `${filePath}`,
        {
          encoding: 'utf-8',
        },
      );
    } catch (err) {
      console.log('Read File Error:' + err);
      return undefined;
    }

    const fileStats = await stat(filePath);
    console.log(fileStats);
    markdownFileDTO.DateCreated =
      fileStats.birthtime;
    markdownFileDTO.LastModified =
      fileStats.mtime;
    markdownFileDTO.Size = fileStats.size;

    return markdownFileDTO;
  }

  // renameFolder(folderDTO: FolderDTO) {
  //   return 'File renamed successfully';
  // }

  // deleteFolder(folderDTO: FolderDTO) {
  //   return 'File deleted successfully';
  // }

  // createFolder(folderDTO: FolderDTO) {
  //   folderDTO.FolderID = '1';
  //   return folderDTO;
  // }

  // moveFolder(folderDTO: FolderDTO) {
  //   return 'File moved successfully';
  // }
}
