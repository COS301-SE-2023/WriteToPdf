import { Injectable } from '@nestjs/common';
import {
  TextractClient,
  FeatureType,
  StartDocumentTextDetectionCommand,
  StartDocumentAnalysisCommand,
  GetDocumentTextDetectionCommand,
  JobStatus,
  GetDocumentAnalysisCommand,
} from '@aws-sdk/client-textract';
import 'dotenv/config';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';

@Injectable()
export class TextractService {
  awsS3BucketName =
    process.env.AWS_S3_BUCKET_NAME;
  awsS3BucketRegion =
    process.env.AWS_S3_BUCKET_REGION;
  awsS3AccessKeyId =
    process.env.AWS_S3_ACCESS_KEY_ID;
  awsS3SecretAccessKey =
    process.env.AWS_S3_SECRET_ACCESS_KEY;
  snsTopicArn =
    process.env.AWS_TEXTRACT_SNS_TOPIC_ARN;
  roleArn = process.env.AWS_S3_TEXTRACT_ROLE_ARN;
  queueUrl =
    process.env.AWS_S3_TEXTRACT_QUEUE_URL;

  private readonly textractClient =
    new TextractClient({
      credentials: {
        accessKeyId: this.awsS3AccessKeyId,
        secretAccessKey:
          this.awsS3SecretAccessKey,
      },
      region: this.awsS3BucketRegion,
    });

  private readonly sqsClient = new SQSClient({
    credentials: {
      accessKeyId: this.awsS3AccessKeyId,
      secretAccessKey: this.awsS3SecretAccessKey,
    },
    region: this.awsS3BucketRegion,
  });

  async _extractDocumentAsynchronous(
    markdownFileDTO: MarkdownFileDTO,
    extractType: string,
  ) {
    const input = {
      DocumentLocation: {
        S3Object: {
          Bucket: this.awsS3BucketName,
          Name: markdownFileDTO.Name,
        },
      },
      NotificationChannel: {
        SNSTopicArn: this.snsTopicArn,
        RoleArn: this.roleArn,
      },
    };

    let command;
    if (extractType === 'text') {
      command =
        new StartDocumentTextDetectionCommand(
          input,
        );
    } else {
      input['FeatureTypes'] = [
        FeatureType.TABLES,
      ];
      command = new StartDocumentAnalysisCommand(
        input,
      );
    }

    const { JobId: jobId } =
      await this.textractClient.send(command);
    console.log(`JobId: ${jobId}`);

    let waitTime = 0;
    const getJob = async () => {
      const { Messages } =
        await this.sqsClient.send(
          new ReceiveMessageCommand({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: 1,
          }),
        );
      if (Messages) {
        console.log(
          `Message[0]: ${Messages[0].Body}`,
        );
        await this.sqsClient.send(
          new DeleteMessageCommand({
            QueueUrl: this.queueUrl,
            ReceiptHandle:
              Messages[0].ReceiptHandle,
          }),
        );
        if (
          JSON.parse(
            JSON.parse(Messages[0].Body).Message,
          ).Status === JobStatus.SUCCEEDED
        ) {
          let getCommand;
          if (extractType === 'text') {
            getCommand =
              new GetDocumentTextDetectionCommand(
                { JobId: jobId },
              );
          } else {
            getCommand =
              new GetDocumentAnalysisCommand({
                JobId: jobId,
              });
          }
          const { Blocks } =
            await this.textractClient.send(
              getCommand,
            );
          this.extraction = {
            Name: this.imageData.objectKey,
            ExtractType: extractType,
            Children:
              this._make_page_hierarchy(Blocks),
          };
          this.inform();
        }
      } else {
        const tick = 5000;
        waitTime += tick;
        console.log(
          `Waited ${
            waitTime / 1000
          } seconds. No messages yet.`,
        );
        setTimeout(getJob, tick);
      }
    };
    await getJob(jobId);
  }
}
