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
import {
  writeFile,
  mkdir,
  access,
  unlink,
  readFile,
  stat,
} from 'fs/promises';
import { SHA256 } from 'crypto-js';

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

    console.log(filePath + '\n');

    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.awsS3BucketName,
        Key: filePath,
      }),
    );

    return await response.Body.transformToString();
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

  // Requires the following fields to be initialised in the DTO:
  // MarkdownID: string; .. TO IDENTIFY THE FILE
  // Path: string; .. TO LOCATE THE FILE in S3
  // UserID: string; .. TO IDENTIFY ROOT DIRECTORY
  async deleteFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    let filePath = '';
    if (markdownFileDTO.Path === '')
      filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.MarkdownID}`;
    else
      filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.Path}/${markdownFileDTO.MarkdownID}`;

    console.log(`./storage/${filePath}`);

    try {
      await access(`./storage/${filePath}`);
    } catch (err) {
      console.log('Access Error --> ' + err);
      return undefined;
    }

    try {
      await unlink(`./storage/${filePath}`);
      /*const response = */ await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.awsS3BucketName,
          Key: filePath,
        }),
      );
    } catch (err) {
      console.log('Delete Error --> ' + err);
      return undefined;
    }

    return markdownFileDTO;
  }

  // Requires the following fields to be initialised in the DTO:
  // Path: string; .. TO LOCATE THE FILE in S3
  // UserID: string; .. TO IDENTIFY ROOT DIRECTORY
  async createFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    // if (markdownFileDTO.Name === undefined)
    //   markdownFileDTO.Name = 'New Document.txt';

    // if (markdownFileDTO.UserID === undefined)
    //   markdownFileDTO.UserID = 1;

    const markdownID = SHA256(
      markdownFileDTO.UserID.toString() +
        new Date().getTime().toString(),
    ).toString();
    markdownFileDTO.MarkdownID = markdownID;

    let filePath = '';
    if (markdownFileDTO.Path === '')
      filePath = `${markdownFileDTO.UserID}`;
    else
      filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.Path}`;

    try {
      await mkdir(`./storage/${filePath}`, {
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
        `./storage/${filePath}/${markdownFileDTO.MarkdownID}`,
        '',
        'utf-8',
      );
      /*const response = */ await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.awsS3BucketName,
          Key: `${filePath}/${markdownFileDTO.MarkdownID}`,
          Body: new Uint8Array(Buffer.from('')),
        }),
      );
    } catch (err) {
      console.log('Write File Error:' + err);
      return undefined;
    }

    const fileStats = await stat(
      `./storage/${filePath}`,
    );
    console.log(fileStats);
    markdownFileDTO.Content = '';
    // markdownFileDTO.DateCreated =
    //   fileStats.birthtime;
    // markdownFileDTO.LastModified =
    //   fileStats.mtime;
    markdownFileDTO.Size = fileStats.size;

    return markdownFileDTO;
  }

  // Requires the following fields to be initialised in the DTO:
  // MarkdownID: string; .. TO IDENTIFY THE FILE
  // Content: string; .. TO SAVE into FILE
  // Path: string; .. TO LOCATE THE FILE in S3
  // UserID: string; .. TO IDENTIFY ROOT DIRECTORY
  async saveFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    console.log(markdownFileDTO);
    let filePath = '';
    if (markdownFileDTO.Path === '')
      filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.MarkdownID}`;
    else
      filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.Path}/${markdownFileDTO.MarkdownID}`;

    console.log(`./storage/${filePath}`);

    try {
      await access(`./storage/${filePath}`);
    } catch (err) {
      console.log('Access Error --> ' + err);
      return undefined;
    }

    const fileData = new Uint8Array(
      Buffer.from(
        JSON.stringify(markdownFileDTO.Content),
      ),
    );

    try {
      await writeFile(
        `./storage/${filePath}`,
        fileData,
        'utf-8',
      );
      /*const response = */ await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.awsS3BucketName,
          Key: filePath,
          Body: fileData,
        }),
      );
    } catch (err) {
      console.log('Write File Error:' + err);
      return undefined;
    }

    const fileStats = await stat(
      `./storage/${filePath}`,
    );
    console.log(fileStats);
    // markdownFileDTO.LastModified =
    //   fileStats.mtime;
    markdownFileDTO.Size = fileStats.size;

    return markdownFileDTO;
  }

  // Requires the following fields to be initialised in the DTO:
  // MarkdownID: string; .. TO IDENTIFY THE FILE
  // Path: string; .. TO LOCATE THE FILE in S3
  // UserID: string; .. TO IDENTIFY ROOT DIRECTORY
  async retrieveFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    let filePath = '';
    let respData = '';
    if (markdownFileDTO.Path === '')
      filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.MarkdownID}`;
    else
      filePath = `${markdownFileDTO.UserID}/${markdownFileDTO.Path}/${markdownFileDTO.MarkdownID}`;

    try {
      await access(`./storage/${filePath}`);
    } catch (err) {
      console.log('Access Error --> ' + err);
      return undefined;
    }

    try {
      markdownFileDTO.Content = await readFile(
        `./storage/${filePath}`,
        {
          encoding: 'utf-8',
        },
      );
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.awsS3BucketName,
          Key: filePath,
        }),
      );
      respData =
        await response.Body.transformToString();
    } catch (err) {
      console.log('Read File Error:' + err);
      return undefined;
    }

    console.log('S3');
    console.log(respData);

    const fileStats = await stat(
      `./storage/${filePath}`,
    );
    console.log(fileStats);
    // markdownFileDTO.DateCreated =
    //   fileStats.birthtime;
    // markdownFileDTO.LastModified =
    //   fileStats.mtime;
    markdownFileDTO.Size = fileStats.size;

    return markdownFileDTO;
  }
}
