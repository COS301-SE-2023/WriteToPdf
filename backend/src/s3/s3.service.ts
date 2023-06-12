import { Injectable } from '@nestjs/common';
import { FileDTO } from './dto/file.dto';
import 'dotenv/config';
import {
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

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

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.awsS3BucketName,
        Key: filePath,
        Body: file,
      }),
    );
    console.log(filePath);
    return fileDTO;
  }
}
